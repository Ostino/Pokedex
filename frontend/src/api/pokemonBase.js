import axios from 'axios';

const API_URL = 'http://localhost:3000/api/pokemonbase';

export const crearPokemonBase = async (datos, token) => {
  const formData = new FormData();

  for (const key in datos) {
    if (datos[key] !== null && datos[key] !== undefined) {
      formData.append(key, datos[key]);
    }
  }

  const res = await axios.post(
    'http://localhost:3000/api/pokemonbase',
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return res.data;
};



export const getAllPokemonBase = async (token) => {
  const res = await axios.get(API_URL, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

export const getPokemonBasePorId = async (id, token) => {
  const res = await axios.get(`${API_URL}/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

export const actualizarPokemonBase = async (id, formData, token) => {
  const res = await axios.put(`${API_URL}/${id}`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

export const eliminarPokemonBase = async (id, token) => {
  const res = await axios.delete(`${API_URL}/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

export const verificarNumeroPokedex = async (numero, token) => {
  const res = await axios.get(`${API_URL}/verificar-numero/${numero}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};


export const asignarStatsBase = async (pokemonBaseId, stats, token) => {
  console.log("Estas son mis stats:",stats)
    console.log("Estas es mi pokemonBaseId",pokemonBaseId)
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };
  const url = `http://localhost:3000/api/pokemonbase/${pokemonBaseId}/asignar-stats`;

  const res = await axios.post(url, stats, config);
  return res.data;
};
export const getStats = async (pokemonBaseId, token) => {
  const res = await axios.get(
    `http://localhost:3000/api/pokemonbase/${pokemonBaseId}/get-stats`,
    headers(token)
  );
  return res.data;
};

export const reasignarStatsBase = async (id, stats, token) => {
  const res = await axios.put(
    `http://localhost:3000/api/pokemonbase/${id}/reasignar-stats`,
    stats,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data;
};

