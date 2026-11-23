import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register as apiRegister } from '../api/auth';
import { getConfigDemo } from '../api/demo';
import AuthTarjeta, { CampoPassword } from '../components/AuthTarjeta';
import '../styles/avisoDemo.css';

export default function Register() {
  const [form, setForm] = useState({ username: '', password: '', email: '' });
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [demo, setDemo] = useState(null);
  const navigate = useNavigate();

  // En la demo pública se avisa de que las cuentas nuevas son temporales.
  useEffect(() => {
    getConfigDemo().then(setDemo).catch(() => setDemo(null));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setEnviando(true);
    try {
      const response = await apiRegister(form);
      // El login recibe el usuario creado para dar la bienvenida y rellenar el formulario.
      navigate('/login', { state: { registrado: response.data?.entrenador?.username ?? form.username.trim() } });
    } catch (err) {
      // El backend explica qué falló (usuario o email en uso, contraseña corta...).
      setError(err.response?.data?.error || 'Error al registrarse. Intenta de nuevo.');
      setEnviando(false);
    }
  };

  return (
    <AuthTarjeta titulo="Crear cuenta" subtitulo="Regístrate para armar tus propios equipos.">
      {demo?.limpiezaMinutos && (
        <p className="aviso-demo aviso-demo--formulario">
          <span className="aviso-demo-icono" aria-hidden="true">⏳</span>
          <span>
            Esta es una demo: las cuentas nuevas y sus equipos <strong>se borran a los {demo.limpiezaMinutos} minutos</strong>.
            {demo.usuarioDemo && (
              <> Si solo quieres probarla, <Link to="/login">entra con la cuenta <code>{demo.usuarioDemo}</code></Link>.</>
            )}
          </span>
        </p>
      )}

      {error && <p className="auth-mensaje auth-mensaje--error" role="alert">{error}</p>}

      <form onSubmit={handleSubmit} className="auth-formulario">
        <div className="auth-campo">
          <label htmlFor="registro-usuario">Usuario</label>
          <input
            id="registro-usuario"
            className="auth-input"
            placeholder="Por ejemplo: ash_ketchum"
            autoComplete="username"
            aria-describedby="registro-usuario-pista"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            required
            minLength={3}
            maxLength={30}
            pattern="\s*[A-Za-z0-9._\-]+\s*"
            title="De 3 a 30 caracteres: letras sin acentos, números, punto, guion o guion bajo"
          />
          <span id="registro-usuario-pista" className="auth-pista">
            De 3 a 30 caracteres: letras sin acentos, números, punto, guion o guion bajo.
          </span>
        </div>
        <div className="auth-campo">
          <label htmlFor="registro-email">Email</label>
          <input
            id="registro-email"
            className="auth-input"
            type="email"
            placeholder="tu@email.com"
            autoComplete="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            maxLength={254}
          />
        </div>
        <div className="auth-campo">
          <label htmlFor="registro-password">Contraseña</label>
          <CampoPassword
            id="registro-password"
            placeholder="Mínimo 6 caracteres"
            autoComplete="new-password"
            aria-describedby="registro-password-pista"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            minLength={6}
            maxLength={72}
            title="Al menos 6 caracteres"
          />
          <span id="registro-password-pista" className="auth-pista">Al menos 6 caracteres.</span>
        </div>
        <button type="submit" className="auth-boton" disabled={enviando}>
          {enviando ? 'Creando cuenta...' : 'Registrarse'}
        </button>
      </form>

      <p className="auth-pie">
        ¿Ya tienes cuenta? <Link to="/login" className="auth-enlace">Inicia sesión</Link>
      </p>
    </AuthTarjeta>
  );
}
