import axios from 'axios';

export const getPokemonAltPorEquipo = async (equipoId, token) => {
  const response = await axios.get(`http://localhost:3000/api/pokemonalt/por-entrenador/${equipoId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
export const crearEVs = async (evs, token) => {
  const res = await axios.post(`http://localhost:3000/api/evs`, evs, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data; // contiene el id del EV creado
};
export const crearIVs = async (ivs, token) => {
  const res = await axios.post(`http://localhost:3000/api/ivs`, ivs, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data; // contiene el id del IV creado
};

export const crearPokemonAlt = async (pokemonAltData, token) => {
    console.log('Payload a enviar2:', pokemonAltData);
  const res = await axios.post(`http://localhost:3000/api/pokemonalt`, pokemonAltData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
export const crearStats = async (stats, token) => {
  const res = await axios.post(`http://localhost:3000/api/stats`, stats, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
