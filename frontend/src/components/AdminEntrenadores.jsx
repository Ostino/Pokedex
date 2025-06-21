import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

export default function AdminEntrenadores() {
  const [entrenadores, setEntrenadores] = useState([]);
  const [mostrar, setMostrar] = useState(false);
  const [error, setError] = useState('');
  const { token } = useContext(AuthContext);

  useEffect(() => {
    if (!mostrar) return;

    const fetchEntrenadores = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/entrenadores/allEntrenadores', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEntrenadores(response.data);
      } catch (err) {
        setError('Error al cargar entrenadores');
      }
    };

    fetchEntrenadores();
  }, [token, mostrar]);

  const hacerAdmin = async (id) => {
    try {
      await axios.patch(`http://localhost:3000/api/entrenadores/${id}/hacer-admin`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      actualizarRolLocal(id, 2);
    } catch {
      alert('Error al promover a admin');
    }
  };

  const quitarAdmin = async (id) => {
    try {
      await axios.patch(`http://localhost:3000/api/entrenadores/${id}/quitar-admin`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      actualizarRolLocal(id, 1);
    } catch {
      alert('Error al degradar a usuario');
    }
  };

  const actualizarRolLocal = (id, nuevoRol) => {
    setEntrenadores((prev) =>
      prev.map((e) => (e.id === id ? { ...e, rol: nuevoRol } : e))
    );
  };

  const cambiarPassword = async (id) => {
    const nuevaPassword = prompt('Nueva contraseña:');
    if (!nuevaPassword) return;
    try {
      await axios.patch(
        `http://localhost:3000/api/entrenadores/${id}/cambiar-password`,
        { password: nuevaPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Contraseña actualizada');
    } catch {
      alert('Error al cambiar la contraseña');
    }
  };

  return (
    <div>
      <h2 onClick={() => setMostrar(!mostrar)} style={{ cursor: 'pointer', userSelect: 'none' }}>
        {mostrar ? '▼ Ocultar' : '▶ Mostrar'} gestión de entrenadores
      </h2>

      {mostrar && (
        <>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <table border="1" cellPadding="8" style={{ marginTop: '10px' }}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Usuario</th>
                <th>Rol</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {entrenadores.map((ent) => (
                <tr key={ent.id}>
                  <td>{ent.id}</td>
                  <td>{ent.username}</td>
                  <td>{ent.rol === 2 ? 'Admin' : 'Usuario'}</td>
                  <td>
                    <button
                      onClick={() => hacerAdmin(ent.id)}
                      disabled={ent.rol === 2}
                    >
                      Promover a admin
                    </button>
                    <button
                      onClick={() => quitarAdmin(ent.id)}
                      disabled={ent.rol === 1 || ent.username === 'admin'}
                      title={
                        ent.username === 'admin'
                          ? 'No se puede degradar al usuario principal "admin"'
                          : ''
                      }
                    >
                      Degradar a usuario
                    </button>
                    <button onClick={() => cambiarPassword(ent.id)}>
                      Cambiar contraseña
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
