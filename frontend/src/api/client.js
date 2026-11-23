import axios from 'axios';

// Cliente compartido: todas las peticiones van a /api del mismo dominio.
// En desarrollo, el proxy de Vite las redirige al backend (ver vite.config.js).
const client = axios.create({ baseURL: '/api' });

export default client;
