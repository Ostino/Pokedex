import client from './client';

export const login = async (credentials) => {
    console.log("Las credeciales son ", credentials)
  const response = await client.post('/auth/login', credentials);
  return response.data;
};

export const register = async (credentials) => {
  return await client.post('/auth/register', credentials);
};

export const getProfile = async (token) => {
  const response = await client.get('/entrenadores/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
export const logout = async (token) => {
  const response = await client.post('/auth/logout', null, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const logoutAll = async (token) => {
  const response = await client.post('/auth/logout-all', null, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
export const getEquiposByEntrenadorId = async (id, token) => {
  const response = await client.get('/equipos/${id}', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
