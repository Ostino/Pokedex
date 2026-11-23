import { useState, useContext, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { login as apiLogin, loginDemo as apiLoginDemo } from '../api/auth';
import { MOTIVO_SALIDA } from '../api/client';
import { getConfigDemo } from '../api/demo';
import { AuthContext } from '../context/AuthContext';
import AuthTarjeta, { CampoPassword } from '../components/AuthTarjeta';
import '../styles/avisoDemo.css';

export default function Login() {
  const location = useLocation();
  // Si viene del registro, llega el usuario recién creado para rellenar el formulario.
  const recienRegistrado = location.state?.registrado;
  const [form, setForm] = useState({ username: recienRegistrado ?? '', password: '' });
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [demo, setDemo] = useState(null);
  // Por qué se cerró la sesión anterior (lo deja el cliente de API al recibir CUENTA_ELIMINADA).
  const [cuentaEliminada] = useState(() => sessionStorage.getItem(MOTIVO_SALIDA) === 'cuenta-eliminada');
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  useEffect(() => {
    sessionStorage.removeItem(MOTIVO_SALIDA);
    getConfigDemo().then(setDemo).catch(() => setDemo(null));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setEnviando(true);
    try {
      const data = await apiLogin(form);
      login(data.token);
      navigate('/profile');
    } catch {
      setError('Usuario o contraseña incorrectos');
      setEnviando(false);
    }
  };

  const entrarComoDemo = async () => {
    setError('');
    setEnviando(true);
    try {
      const data = await apiLoginDemo();
      login(data.token);
      navigate('/profile');
    } catch {
      setError('No se pudo entrar con la cuenta demo. Intenta de nuevo.');
      setEnviando(false);
    }
  };

  const usuarioDemo = demo?.usuarioDemo;

  return (
    <AuthTarjeta titulo="Iniciar sesión" subtitulo="Entra para armar y gestionar tus equipos.">
      {recienRegistrado && !cuentaEliminada && (
        <p className="auth-mensaje" role="status">
          Cuenta <strong>{recienRegistrado}</strong> creada. Ya puedes iniciar sesión.
        </p>
      )}

      {cuentaEliminada && (
        <p className="aviso-demo aviso-demo--formulario" role="status">
          <span className="aviso-demo-icono" aria-hidden="true">⏳</span>
          <span>
            <strong>Tu cuenta de prueba expiró</strong>
            {demo?.limpiezaMinutos ? ` (en esta demo duran ${demo.limpiezaMinutos} minutos)` : ''}.
            {' '}<Link to="/register">Crea otra</Link>
            {usuarioDemo && <> o entra con la cuenta <code>{usuarioDemo}</code></>}.
          </span>
        </p>
      )}

      {error && <p className="auth-mensaje auth-mensaje--error" role="alert">{error}</p>}

      <form onSubmit={handleSubmit} className="auth-formulario">
        <div className="auth-campo">
          <label htmlFor="login-usuario">Usuario</label>
          <input
            id="login-usuario"
            className="auth-input"
            placeholder="Tu nombre de usuario"
            autoComplete="username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            required
          />
        </div>
        <div className="auth-campo">
          <label htmlFor="login-password">Contraseña</label>
          <CampoPassword
            id="login-password"
            placeholder="Tu contraseña"
            autoComplete="current-password"
            autoFocus={!!recienRegistrado}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
        </div>
        <button type="submit" className="auth-boton" disabled={enviando}>
          {enviando ? 'Entrando...' : 'Entrar'}
        </button>
      </form>

      {usuarioDemo && (
        <div className="auth-demo">
          <p className="auth-separador"><span>o</span></p>
          <button type="button" className="auth-boton auth-boton--secundario" onClick={entrarComoDemo} disabled={enviando}>
            <span aria-hidden="true">▶</span> Entrar con la cuenta demo
          </button>
          <p className="auth-nota">
            Sin registrarte.
            {demo?.limpiezaMinutos ? ` Los equipos que crees se borran a los ${demo.limpiezaMinutos} minutos.` : ''}
          </p>
        </div>
      )}

      <p className="auth-pie">
        ¿No tienes cuenta? <Link to="/register" className="auth-enlace">Regístrate aquí</Link>
      </p>
    </AuthTarjeta>
  );
}
