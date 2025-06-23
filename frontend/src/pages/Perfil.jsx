import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, logout as apiLogout, logoutAll as apiLogoutAll, getEquiposByEntrenadorId } from '../api/auth';
import { AuthContext } from '../context/AuthContext';
import { crearEquipo, eliminarEquipo } from '../api/equipos';

export default function Perfil() {
  const [userData, setUserData] = useState(null);
  const [equipos, setEquipos] = useState([]);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState('');
  const { token, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfileAndEquipos = async () => {
      setError('');
      try {
        const user = await getProfile(token);
        setUserData(user);

        const dataEquipos = await getEquiposByEntrenadorId(user.id, token);
        setEquipos(dataEquipos.equipos || []);
      } catch (err) {
        setError('Token inválido o expirado, por favor loguéate de nuevo.');
        logout();
      }
    };

    fetchProfileAndEquipos();
  }, [token, logout]);

  const handleLogout = async () => {
    try {
      await apiLogout(token);
    } catch (err) {
      console.warn('Error al cerrar sesión en backend:', err);
    } finally {
      logout();
    }
  };

  const handleLogoutAll = async () => {
    try {
      await apiLogoutAll(token);
    } catch (err) {
      console.warn('Error al cerrar todas las sesiones:', err);
    } finally {
      logout();
    }
  };

  const handleCrearEquipo = async () => {
    try {
      await crearEquipo(nuevoNombre, token);
      setNuevoNombre('');
      setShowModal(false);
      // Recargar equipos
      const dataEquipos = await getEquiposByEntrenadorId(userData.id, token);
      setEquipos(dataEquipos.equipos || []);
    } catch (err) {
      console.error('Error al crear equipo:', err);
    }
  };
const handleEliminarEquipo = async (id) => {
  if (!window.confirm('¿Estás seguro que quieres eliminar este equipo?')) return;

  try {
    await eliminarEquipo(id, token);
    const dataEquipos = await getEquiposByEntrenadorId(userData.id, token);
    setEquipos(dataEquipos.equipos || []);
  } catch (err) {
    console.error('Error al eliminar equipo:', err);
  }
};

  const goToAdminPage = () => navigate('/admin');

  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!userData) return <p>Cargando perfil...</p>;

  return (
    <div>
      <h2>Perfil</h2>
      <p><strong>Usuario:</strong> {userData.username}</p>
      <p><strong>Rol:</strong> {userData.rol}</p>

      {userData.rol === 2 && (
        <button onClick={goToAdminPage}>Página Adm</button>
      )}

      <button onClick={handleLogout}>Cerrar sesión</button>
      <button onClick={handleLogoutAll}>Cerrar todas las sesiónes</button>

      <h3>Equipos del Entrenador</h3>
      {equipos.length === 0 ? (
        <p>No tiene equipos registrados.</p>
      ) : (
        <ul>
  {equipos.map((equipo) => (
    <li key={equipo.id}>
      <strong>Nombre:</strong> {equipo.nombre}
      <button
        onClick={() => navigate(`/editar-equipo/${equipo.id}`)}
        style={{ marginLeft: '10px' }}
      >
        Editar
      </button>
      <button
        onClick={() => handleEliminarEquipo(equipo.id)}
        style={{ marginLeft: '10px', color: 'red' }}
      >
        Eliminar
      </button>
    </li>
  ))}
</ul>


      )}

      <button onClick={() => setShowModal(true)}>➕ Crear Equipo</button>

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex',
          alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{ background: '#fff', padding: '20px', borderRadius: '10px', minWidth: '300px' }}>
            <h3>Nuevo Equipo</h3>
            <input
              type="text"
              value={nuevoNombre}
              onChange={(e) => setNuevoNombre(e.target.value)}
              placeholder="Nombre del equipo"
            />
            <br /><br />
            <button onClick={handleCrearEquipo}>Guardar</button>
            <button onClick={() => setShowModal(false)} style={{ marginLeft: '10px' }}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
}
