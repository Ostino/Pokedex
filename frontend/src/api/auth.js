import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export const login = async (credentials) => {
    console.log("Las credeciales son ", credentials)
  const response = await axios.post(`${API_URL}/auth/login`, credentials);
  return response.data;
};

export const register = async (credentials) => {
  return await axios.post('http://localhost:3000/api/auth/register', credentials);
};

export const getProfile = async (token) => {
  const response = await axios.get(`${API_URL}/entrenadores/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
export const logout = async (token) => {
  const response = await axios.post(`${API_URL}/auth/logout`, null, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const logoutAll = async (token) => {
  const response = await axios.post(`${API_URL}/auth/logout-all`, null, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
export const getEquiposByEntrenadorId = async (id, token) => {
  const response = await axios.get(`${API_URL}/equipos/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
