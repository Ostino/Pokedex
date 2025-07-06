import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api';

export const getMovimientos = async (token) => {
  const res = await axios.get(`${BASE_URL}/movimientos`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const getMovimientoPorId = async (id, token) => {
  const res = await axios.get(`${BASE_URL}/movimientos/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export async function crearMovimiento(datos, token) {
  const res = await axios.post(`${BASE_URL}/movimientos`, datos, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  return res.data;
}

export async function actualizarMovimiento(id, datos, token) {
  const res = await axios.put(`${BASE_URL}/movimientos/${id}`, datos, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  return res.data;
}

export const eliminarMovimiento = async (id, token) => {
  await axios.delete(`${BASE_URL}/movimientos/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getTipos = async () => {
  const res = await axios.get(`${BASE_URL}/tipos`);
  return res.data;
};

export const getCategoriasMovimiento = async () => {
  const res = await axios.get(`${BASE_URL}/categoriamov`);
  return res.data;
};
