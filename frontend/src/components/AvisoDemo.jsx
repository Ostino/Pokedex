import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile } from '../api/auth';
import { AuthContext } from '../context/AuthContext';
import '../styles/avisoDemo.css';

const REVISAR_CADA_MS = 30 * 1000;

// Aviso para la demo pública: cuánto le queda a una cuenta de prueba, o que los equipos de la
// cuenta demo son temporales. Revisa la cuenta cada 30 s; si ya se borró, cierra la sesión
// (el login explica el motivo). Sin limpieza activa no muestra nada.
export default function AvisoDemo() {
  const { token, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [info, setInfo] = useState(null);
  const [ahora, setAhora] = useState(() => Date.now());

  useEffect(() => {
    if (!token) return undefined;
    let activo = true;

    const revisar = async () => {
      try {
        const perfil = await getProfile(token);
        if (activo) setInfo(perfil.limpiezaDemo);
      } catch (err) {
        if (activo && err.response?.data?.codigo === 'CUENTA_ELIMINADA') {
          logout();
          navigate('/login');
        }
      }
      if (activo) setAhora(Date.now());
    };

    revisar();
    const intervalo = setInterval(revisar, REVISAR_CADA_MS);
    return () => { activo = false; clearInterval(intervalo); };
  }, [token, logout, navigate]);

  if (!info) return null;

  if (info.cuentaExpiraEn) {
    const minutosRestantes = Math.ceil((new Date(info.cuentaExpiraEn).getTime() - ahora) / 60000);
    const cuando = minutosRestantes <= 1 ? 'en menos de un minuto' : `en ${minutosRestantes} min`;
    return (
      <p className="aviso-demo" role="status">
        <span className="aviso-demo-icono" aria-hidden="true">⏳</span>
        <span>
          <strong>Cuenta de prueba:</strong> se borrará {cuando}, junto con sus equipos.
          Las cuentas nuevas duran {info.minutos} minutos en esta demo.
        </span>
      </p>
    );
  }

  if (info.equiposTemporales) {
    return (
      <p className="aviso-demo" role="status">
        <span className="aviso-demo-icono" aria-hidden="true">⏳</span>
        <span>
          <strong>Cuenta demo:</strong> los equipos que crees se borran a los {info.minutos} minutos.
        </span>
      </p>
    );
  }

  return null;
}
