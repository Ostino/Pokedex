import axios from 'axios';

const API_URL = 'http://localhost:3000/api/equipos';

export const crearEquipo = async (nombre, token) => {
  const response = await axios.post(API_URL, { nombre }, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
export const eliminarEquipo = async (id, token) => {
  const response = await axios.delete(`${API_URL}/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
