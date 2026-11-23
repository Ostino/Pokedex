import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, logout as apiLogout, logoutAll as apiLogoutAll, getEquiposByEntrenadorId } from '../api/auth';
import { AuthContext } from '../context/AuthContext';
import { crearEquipo, eliminarEquipo } from '../api/equipos';
import AvisoDemo from '../components/AvisoDemo';
import '../styles/compartido.css';
import '../styles/Perfil.css';

const NOMBRES_ROL = { 1: 'Entrenador', 2: 'Administrador' };

// Pokéball dibujada con CSS. Si recibe `letra`, la muestra en el botón central.
function Pokeball({ className = '', letra }) {
  return (
    <span className={`perfil-pokeball ${className}`} aria-hidden="true">
      <span className="perfil-pokeball-boton">{letra}</span>
    </span>
  );
}

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
      } catch {
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

  const cerrarModal = () => {
    setShowModal(false);
    setNuevoNombre('');
  };

  const handleCrearEquipo = async (e) => {
    e.preventDefault();
    const nombre = nuevoNombre.trim();
    if (!nombre) return;
    try {
      await crearEquipo(nombre, token);
      cerrarModal();
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

  if (error) return <p className="perfil-mensaje perfil-mensaje--error">{error}</p>;
  if (!userData) {
    return (
      <div className="perfil-mensaje perfil-cargando">
        <Pokeball className="perfil-pokeball--girando" />
        <p>Cargando perfil...</p>
      </div>
    );
  }

  const esAdmin = userData.rol === 2;
  const nombreRol = NOMBRES_ROL[userData.rol] || `Rol ${userData.rol}`;

  return (
    <main className="perfil-pagina">
      <AvisoDemo />
      <section className="perfil-tarjeta" aria-labelledby="perfil-nombre">
        <div className="perfil-tarjeta-banda">
          <span className="perfil-tarjeta-etiqueta">Tarjeta de entrenador</span>
        </div>

        <div className="perfil-tarjeta-cuerpo">
          <Pokeball className="perfil-avatar" letra={userData.username.charAt(0).toUpperCase()} />

          <div className="perfil-identidad">
            <h1 id="perfil-nombre" className="perfil-nombre">{userData.username}</h1>
            <span className={`perfil-rol ${esAdmin ? 'perfil-rol--admin' : ''}`}>{nombreRol}</span>
          </div>

          <dl className="perfil-datos">
            <div className="perfil-dato">
              <dt>Equipos</dt>
              <dd>{equipos.length}</dd>
            </div>
            <div className="perfil-dato">
              <dt>ID</dt>
              <dd>#{String(userData.id).padStart(3, '0')}</dd>
            </div>
          </dl>
        </div>

        <div className="perfil-acciones">
          {esAdmin && (
            <button type="button" className="perfil-boton perfil-boton--primario perfil-boton--ancho" onClick={goToAdminPage}>
              Zona de administrador
            </button>
          )}
          <button type="button" className="perfil-boton perfil-boton--contorno" onClick={handleLogout}>
            Cerrar sesión
          </button>
          <button type="button" className="perfil-boton perfil-boton--contorno" onClick={handleLogoutAll}>
            Cerrar todas las sesiones
          </button>
        </div>
      </section>

      <section className="perfil-equipos" aria-labelledby="perfil-equipos-titulo">
        <header className="perfil-equipos-cabecera">
          <h2 id="perfil-equipos-titulo" className="perfil-equipos-titulo">
            Mis equipos <span className="perfil-contador">{equipos.length}</span>
          </h2>
          <button type="button" className="perfil-boton perfil-boton--primario" onClick={() => setShowModal(true)}>
            + Nuevo equipo
          </button>
        </header>

        {equipos.length === 0 ? (
          <div className="perfil-vacio">
            <Pokeball className="perfil-pokeball--grande" />
            <p className="perfil-vacio-titulo">Todavía no tienes equipos</p>
            <p className="perfil-vacio-texto">Crea tu primer equipo y empieza a elegir a tus Pokémon.</p>
          </div>
        ) : (
          <ul className="perfil-lista-equipos">
            {equipos.map((equipo) => (
              <li key={equipo.id} className="perfil-equipo">
                <div className="perfil-equipo-info">
                  <Pokeball className="perfil-pokeball--mini" />
                  <span className="perfil-equipo-nombre" title={equipo.nombre}>{equipo.nombre}</span>
                </div>
                <div className="perfil-equipo-acciones">
                  <button
                    type="button"
                    className="perfil-boton perfil-boton--primario perfil-boton--chico"
                    onClick={() => navigate('/editar-equipo', { state: { equipo } })}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    className="perfil-boton perfil-boton--peligro perfil-boton--chico"
                    onClick={() => handleEliminarEquipo(equipo.id)}
                    aria-label={`Eliminar el equipo ${equipo.nombre}`}
                  >
                    Eliminar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {showModal && (
        <div
          className="perfil-modal-fondo"
          onClick={cerrarModal}
          onKeyDown={(e) => e.key === 'Escape' && cerrarModal()}
        >
          <form
            className="perfil-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="perfil-modal-titulo"
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleCrearEquipo}
          >
            <h3 id="perfil-modal-titulo" className="perfil-modal-titulo">Nuevo equipo</h3>
            <label className="perfil-modal-etiqueta" htmlFor="perfil-nombre-equipo">Nombre del equipo</label>
            <input
              id="perfil-nombre-equipo"
              className="perfil-modal-input"
              type="text"
              value={nuevoNombre}
              onChange={(e) => setNuevoNombre(e.target.value)}
              placeholder="Por ejemplo: Equipo Kanto"
              maxLength={50}
              autoFocus
            />
            <div className="perfil-modal-botones">
              <button type="button" className="perfil-boton perfil-boton--secundario" onClick={cerrarModal}>
                Cancelar
              </button>
              <button type="submit" className="perfil-boton perfil-boton--primario" disabled={!nuevoNombre.trim()}>
                Crear equipo
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
