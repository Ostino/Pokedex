import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as apiLogin } from '../api/auth';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import '../styles/Login.css'
export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const data = await apiLogin(form);
      login(data.token);
      navigate('/profile');
    } catch {
      setError('Usuario o contraseña incorrectos');
    }
  };

  return (
    <div className="login-container">
  <h2 className="login-title">Iniciar Sesión</h2>

  {error && <p className="login-error">{error}</p>}

  <form onSubmit={handleSubmit} className="login-form">
    <input
      className="login-input"
      placeholder="Usuario"
      value={form.username}
      onChange={(e) => setForm({ ...form, username: e.target.value })}
      required
    />
    <input
      type="password"
      className="login-input"
      placeholder="Contraseña"
      value={form.password}
      onChange={(e) => setForm({ ...form, password: e.target.value })}
      required
    />
    <button type="submit" className="login-button">
      Entrar
    </button>

    <p className="login-register-text">
      ¿No tienes cuenta?{' '}
      <Link to="/register" className="login-register-link">
        Regístrate aquí
      </Link>
    </p>
  </form>
</div>

  );
}
