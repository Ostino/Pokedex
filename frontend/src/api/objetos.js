import client from './client';

const API_URL = '/objetos';

export const getObjetos = async (token) => {
  const res = await client.get(API_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const getObjetoPorId = async (id, token) => {
  const res = await client.get(`${API_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const crearObjeto = async (datos, token) => {
  const formData = new FormData();
  formData.append('nombre', datos.nombre);
  if (datos.descripcion) formData.append('descripcion', datos.descripcion);
  if (datos.imagen) formData.append('imagen', datos.imagen);

  const res = await client.post(API_URL, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

export const actualizarObjeto = async (id, datos, token) => {
  const formData = new FormData();
  if (datos.nombre) formData.append('nombre', datos.nombre);
  if (datos.descripcion) formData.append('descripcion', datos.descripcion);
  if (datos.imagen) formData.append('imagen', datos.imagen);

  const res = await client.put(`${API_URL}/${id}`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

export const eliminarObjeto = async (id, token) => {
  await client.delete(`${API_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
