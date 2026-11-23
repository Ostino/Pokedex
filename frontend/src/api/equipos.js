import client from './client';

const API_URL = '/equipos';

export const crearEquipo = async (nombre, token) => {
  const response = await client.post(API_URL, { nombre }, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
export const eliminarEquipo = async (id, token) => {
  const response = await client.delete(`${API_URL}/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
