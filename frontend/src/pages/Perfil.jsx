import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, logout as apiLogout, logoutAll as apiLogoutAll, getEquiposByEntrenadorId } from '../api/auth';
import { AuthContext } from '../context/AuthContext';
import { crearEquipo, eliminarEquipo } from '../api/equipos';
import '../styles/perfil.css';
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

  if (error) return <p className="error-message">{error}</p>;
  if (!userData) return <p className="loading-message">Cargando perfil...</p>;

  return (
    <div className="perfil-container">
      <h2 className="perfil-title">Perfil</h2>
      <p><strong>Usuario:</strong> {userData.username}</p>
      <p><strong>Rol:</strong> {userData.rol}</p>

      {userData.rol === 2 && (
        <button className="btn btn-admin" onClick={goToAdminPage}>Página Adm</button>
      )}

      <div className="perfil-buttons">
        <button className="btn btn-logout" onClick={handleLogout}>Cerrar sesión</button>
        <button className="btn btn-logout" onClick={handleLogoutAll}>Cerrar todas las sesiónes</button>
      </div>

      <h3 className="subtitulos">Equipos del Entrenador</h3>

      {equipos.length === 0 ? (
        <p className="no-equipos-msg">No tiene equipos registrados.</p>
      ) : (
        <ul className="lista-equipos">
          {equipos.map((equipo) => (
            <li key={equipo.id} className="equipo-item">
              <span><strong>Nombre:</strong> {equipo.nombre}</span>
              <div className="equipo-actions">
                <button
                  className="btn btn-editar"
                  onClick={() => navigate("/editar-equipo", { state: { equipo } })}
                >
                  Editar
                </button>
                <button
                  className="btn btn-eliminar"
                  onClick={() => handleEliminarEquipo(equipo.id)}
                >
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <button className="btn btn-crear-equipo" onClick={() => setShowModal(true)}>➕ Crear Equipo</button>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Nuevo Equipo</h3>
            <input
              className="modal-input"
              type="text"
              value={nuevoNombre}
              onChange={(e) => setNuevoNombre(e.target.value)}
              placeholder="Nombre del equipo"
            />
            <div className="modal-buttons">
              <button className="btn btn-guardar" onClick={handleCrearEquipo}>Guardar</button>
              <button className="btn btn-cancelar" onClick={() => setShowModal(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
