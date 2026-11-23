import client from './client';

const headers = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

export const getTipos = async (token) => {
  const res = await client.get('/tipos', headers(token));
  return res.data;
};

export const getNaturalezas = async (token) => {
  const res = await client.get('/naturalezas', headers(token));
  return res.data;
};

export const getHabilidades = async (token) => {
  const res = await client.get('/habilidades', headers(token));
  return res.data;
};

export const getObjetos = async (token) => {
  const res = await client.get('/objetos', headers(token));
  return res.data;
};

export const getMovimientos = async (token) => {
  const res = await client.get('/movimientos', headers(token));
  return res.data;
};

export const verificarNumeroPokedex = async (numero, token) => {
  const res = await client.get(`/pokemonbase/verificar-numero/${numero}`, headers(token));
  return res.data;
};
export const getAllPokemonBase = async (token) => {
  const res = await client.get(`/pokemonbase`, headers(token));
  return res.data;
};