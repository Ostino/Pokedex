import axios from 'axios';

// Cliente compartido: todas las peticiones van a /api del mismo dominio.
// En desarrollo, el proxy de Vite las redirige al backend (ver vite.config.js).
const client = axios.create({ baseURL: '/api' });

// Clave de sessionStorage con el motivo por el que se cerró la sesión, para explicarlo en el login.
export const MOTIVO_SALIDA = 'motivoSalida';

// Si el backend avisa de que la cuenta ya no existe (la borró la limpieza de la demo), se guarda
// el motivo. Las páginas siguen tratando el 401 como siempre (cerrar sesión e ir al login).
client.interceptors.response.use(
  (respuesta) => respuesta,
  (error) => {
    if (error.response?.status === 401 && error.response.data?.codigo === 'CUENTA_ELIMINADA') {
      sessionStorage.setItem(MOTIVO_SALIDA, 'cuenta-eliminada');
    }
    return Promise.reject(error);
  }
);

export default client;
