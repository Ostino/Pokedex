import client from './client';


export const getMovimientos = async (token) => {
  const res = await client.get(`/movimientos`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const getMovimientoPorId = async (id, token) => {
  const res = await client.get(`/movimientos/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export async function crearMovimiento(datos, token) {
  const res = await client.post(`/movimientos`, datos, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  return res.data;
}

export async function actualizarMovimiento(id, datos, token) {
  const res = await client.put(`/movimientos/${id}`, datos, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  return res.data;
}

export const eliminarMovimiento = async (id, token) => {
  await client.delete(`/movimientos/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getTipos = async () => {
  const res = await client.get(`/tipos`);
  return res.data;
};

export const getCategoriasMovimiento = async () => {
  const res = await client.get(`/categoriamov`);
  return res.data;
};
