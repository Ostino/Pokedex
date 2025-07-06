import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register as apiRegister } from '../api/auth';
import '../styles/register.css'
export default function Register() {
  const [form, setForm] = useState({ username: '', password: '' ,email:''});
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await apiRegister(form);

      if (response.status === 201 || response.status === '201') {
        navigate('/login');
      } else {
        setError('Registro fallido. Intenta de nuevo.');
      }
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setError('Ese nombre de usuario ya está en uso');
      } else {
        setError('Error al registrarse. Intenta de nuevo.');
      }
    }
  };

  return (
    <div className="register-container">
  <h2 className="register-title">Registro</h2>

  {error && <p className="register-error">{error}</p>}

  <form onSubmit={handleSubmit} className="register-form">
    <input
      className="register-input"
      placeholder="Usuario"
      value={form.username}
      onChange={(e) => setForm({ ...form, username: e.target.value })}
      required
    />
    <input
      className="register-input"
      type="email"
      placeholder="Email"
      value={form.email}
      onChange={(e) => setForm({ ...form, email: e.target.value })}
      required
    />
    <input
      className="register-input"
      type="password"
      placeholder="Contraseña"
      value={form.password}
      onChange={(e) => setForm({ ...form, password: e.target.value })}
      required
    />
    <button type="submit" className="register-button">Registrarse</button>
  </form>

  <p className="register-login-text">
    ¿Ya tienes cuenta?{' '}
    <a href="/login" className="register-login-link">
      Inicia sesión
    </a>
  </p>
</div>

  );
}
