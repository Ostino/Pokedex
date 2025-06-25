import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register as apiRegister } from '../api/auth';

export default function Register() {
  const [form, setForm] = useState({ username: '', password: '' ,email:''});
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await apiRegister(form);

      // Si el backend devuelve código 201, redirige al login
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
    <div>
      <h2>Registro</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Usuario"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        <button type="submit">Registrarse</button>
      </form>

      <p>
        ¿Ya tienes cuenta?{' '}
        <a href="/login" style={{ color: 'blue' }}>
          Inicia sesión
        </a>
      </p>
    </div>
  );
}
