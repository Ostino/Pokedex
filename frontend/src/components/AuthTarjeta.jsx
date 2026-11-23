import { useState } from 'react';
import '../styles/auth.css';

// Tarjeta común de las páginas de inicio de sesión y registro.
export default function AuthTarjeta({ titulo, subtitulo, children }) {
  return (
    <main className="auth-pagina">
      <section className="auth-tarjeta" aria-labelledby="auth-titulo">
        <header className="auth-banda">
          <span className="auth-pokeball" aria-hidden="true" />
          <span className="auth-marca">Pokédex</span>
        </header>
        <div className="auth-cuerpo">
          <h1 id="auth-titulo" className="auth-titulo">{titulo}</h1>
          {subtitulo && <p className="auth-subtitulo">{subtitulo}</p>}
          {children}
        </div>
      </section>
    </main>
  );
}

// Campo de contraseña con botón para mostrarla u ocultarla.
export function CampoPassword({ id, ...props }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="auth-password">
      <input id={id} className="auth-input" type={visible ? 'text' : 'password'} {...props} />
      <button
        type="button"
        className="auth-ver-password"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        aria-pressed={visible}
      >
        {visible ? 'Ocultar' : 'Mostrar'}
      </button>
    </div>
  );
}
