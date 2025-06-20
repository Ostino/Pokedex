import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as apiLogin } from '../api/auth';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
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
    <div>
      <h2>Login</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Usuario"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        <button type="submit">Entrar</button>
        <p>
  ¿No tienes cuenta?{' '}
  <Link to="/register" style={{ color: 'blue' }}>
    Regístrate aquí
  </Link>
</p>
      </form>
    </div>
  );
}
