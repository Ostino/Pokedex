import axios from 'axios';

export const getPokemonAltPorEquipo = async (equipoId, token) => {
  const response = await axios.get(`http://localhost:3000/api/pokemonsalt/por-entrenador/${equipoId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
