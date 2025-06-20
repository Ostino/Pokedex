import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getProfile } from '../api/auth';

export default function AuthGuard({ children }) {
  const { token, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      try {
        await getProfile(token); // verifica token
        setChecking(false);
      } catch (err) {
        // Si hay error 401, el token es inválido o expiró
        logout(); // borra token de sessionStorage
        navigate('/login'); // redirige
      }
    };

    if (token) {
      verifyToken();
    } else {
      navigate('/login');
    }
  }, [token, logout, navigate]);

  if (checking) return <p>Verificando sesión...</p>;

  return <>{children}</>;
}
