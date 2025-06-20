import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, logout as apiLogout, logoutAll as apiLogoutAll } from '../api/auth';
import { AuthContext } from '../context/AuthContext';

export default function Perfil() {
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState('');
  const { token, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      setError('');
      try {
        const data = await getProfile(token);
        setUserData(data);
      } catch (err) {
        setError('Token inválido o expirado, por favor loguéate de nuevo.');
        logout();
      }
    };

    fetchProfile();
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

  const goToAdminPage = () => {
    navigate('/admin');
  };

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
    </div>
  );
}
