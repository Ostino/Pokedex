import client from './client';

// Configuración pública de la demo: { limpiezaMinutos: número | null, usuarioDemo: 'demo' | null }.
export const getConfigDemo = async () => {
  const res = await client.get('/demo');
  return res.data;
};
