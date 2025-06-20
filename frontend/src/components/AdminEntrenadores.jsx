import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

export default function AdminEntrenadores() {
  const [entrenadores, setEntrenadores] = useState([]);
  const [error, setError] = useState('');
  const { token } = useContext(AuthContext);

  useEffect(() => {
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
  }, [token]);

  const cambiarRol = async (id, accion) => {
    const url = `http://localhost:3000/api/entrenadores/${id}/${accion}`;
    try {
      await axios.patch(url, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // recarga lista tras cambio
      setEntrenadores((prev) =>
        prev.map((e) => (e.id === id ? { ...e, rol: accion === 'hacer-admin' ? 2 : 1 } : e))
      );
    } catch {
      alert('Error al cambiar el rol');
    }
  };

  const cambiarPassword = async (id) => {
    const nuevaPassword = prompt('Nueva contraseña:');
    if (!nuevaPassword) return;
    try {
      await axios.patch(
        `http://localhost:3000/api/entrenadores/${id}/cambiar-password`,
        { nuevaPassword: nuevaPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Contraseña actualizada');
    } catch {
      alert('Error al cambiar la contraseña');
    }
  };

  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <h2>Gestión de Entrenadores</h2>
      <table border="1" cellPadding="8">
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
                {ent.rol === 1 ? (
                  <button onClick={() => cambiarRol(ent.id, 'hacer-admin')}>Promover a admin</button>
                ) : (
                  <button onClick={() => cambiarRol(ent.id, 'quitar-admin')}>Degradar a usuario</button>
                )}
                <button onClick={() => cambiarPassword(ent.id)}>Cambiar contraseña</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
