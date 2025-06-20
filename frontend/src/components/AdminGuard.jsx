import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

export default function AdminGuard({ children }) {
  const { token, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const verifyAdmin = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/entrenadores/admin', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          validateStatus: () => true, // permite capturar todos los códigos
        });

        if (response.status === 200) {
          setChecking(false); // acceso permitido
        } else if (response.status === 403) {
          navigate('/profile'); // acceso denegado, pero token válido
        } else if (response.status === 401) {
          logout(); // token inválido
          navigate('/login');
        } else {
          logout(); // fallback por seguridad
          navigate('/login');
        }
      } catch (err) {
        logout(); // en caso de fallo inesperado
        navigate('/login');
      }
    };

    if (token) {
      verifyAdmin();
    } else {
      navigate('/login');
    }
  }, [token, logout, navigate]);

  if (checking) return <p>Verificando privilegios de administrador...</p>;

  return <>{children}</>;
}
