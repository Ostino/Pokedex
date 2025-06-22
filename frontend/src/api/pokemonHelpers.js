// pokemonbaseHelpers.js
import axios from 'axios';

const headers = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

export const getTipos = async (token) => {
  const res = await axios.get('http://localhost:3000/api/tipos', headers(token));
  return res.data;
};

export const getNaturalezas = async (token) => {
  const res = await axios.get('http://localhost:3000/api/naturalezas', headers(token));
  return res.data;
};

export const getHabilidades = async (token) => {
  const res = await axios.get('http://localhost:3000/api/habilidades', headers(token));
  return res.data;
};

export const getObjetos = async (token) => {
  const res = await axios.get('http://localhost:3000/api/objetos', headers(token));
  return res.data;
};

export const getMovimientos = async (token) => {
  const res = await axios.get('http://localhost:3000/api/movimientos', headers(token));
  return res.data;
};

export const verificarNumeroPokedex = async (numero, token) => {
  const res = await axios.get(`http://localhost:3000/api/pokemonbase/verificar-numero/${numero}`, headers(token));
  return res.data;
};
