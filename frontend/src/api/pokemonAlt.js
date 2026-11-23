import client from './client';

export const getPokemonAltPorEquipo = async (equipoId, token) => {
          console.log("El id del equipo essss ",equipoId)
  const response = await client.get(`/pokemonalt/por-entrenador/${equipoId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  console.log("El equipo es ss ",response.data)
  return response.data;
};
export const getPokemonAltPorEquipos = async (equipoId, token) => {
          console.log("El id del equipo essss ",equipoId)
  const response = await client.get(`/pokemonalt/por-equipo/${equipoId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  console.log("El equipo es ss ",response.data)
  return response.data;
};
export const crearEVs = async (evs, token) => {
  const res = await client.post(`/evs`, evs, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
export const crearIVs = async (ivs, token) => {
  const res = await client.post(`/ivs`, ivs, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const crearPokemonAlt = async (pokemonAltData, token) => {
    console.log('Payload a enviar2:', pokemonAltData);
  const res = await client.post(`/pokemonalt`, pokemonAltData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
export const crearStats = async (stats, token) => {
  const res = await client.post(`/stats`, stats, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const eliminarPokemonAlt = async (id, token) => {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
    await client.delete(`/pokemonalt/${id}`, config);
  } catch (error) {
    throw error;
  }
};