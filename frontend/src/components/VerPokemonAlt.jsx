import { useEffect, useState,useContext  } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

export default function VerPokemon({ id }) {
  const [pokemon, setPokemon] = useState(null);
  const [error, setError] = useState(null);
  const { token } = useContext(AuthContext);

  useEffect(() => {
    const fetchPokemon = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/pokemonalt/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
        setPokemon(response.data);
      } catch (err) {
        console.error(err);
        setError('No se pudo cargar el Pokémon.');
      }
    };

    fetchPokemon();
  }, [id]);

  if (error) return <p>{error}</p>;
  if (!pokemon) return <p>Cargando...</p>;

  const tipoImg = (tipo) => tipo ? `http://localhost:3000/Imagenes/TipoElemento/${tipo.imagen}` : null;
  const objetoImg = pokemon.objeto?.imagen ? `http://localhost:3000/Imagenes/Objetos/${pokemon.objeto.imagen}` : null;
  const pokeImg = pokemon.imagen ? `http://localhost:3000/Imagenes/Pokemons/${pokemon.imagen}` : null;

  return (
    <div style={{ border: '1px solid #1976d2', borderRadius: '10px', padding: '20px', marginTop: '20px', backgroundColor: '#f8f9fa' }}>
      <h3>#{pokemon.numeroPokedex}</h3>
      {pokeImg && <img src={pokeImg} alt={pokemon.numeroPokedex} style={{ width: '100px', height: '100px' }} />}

      <p><strong>Tipo 1:</strong> {pokemon.tipoPrimario?.nombre} {pokemon.tipoPrimario && <img src={tipoImg(pokemon.tipoPrimario)} alt={pokemon.tipoPrimario.nombre} width={25} />}</p>
      <p><strong>Tipo 2:</strong> {pokemon.tipoSecundario?.nombre ?? 'Ninguno'} {pokemon.tipoSecundario && <img src={tipoImg(pokemon.tipoSecundario)} alt={pokemon.tipoSecundario.nombre} width={25} />}</p>

      <p><strong>Naturaleza:</strong> {pokemon.naturaleza?.nombre}</p>
      <p><strong>Habilidad:</strong> {pokemon.habilidad?.nombre}</p>
      <p><strong>Objeto:</strong> {pokemon.objeto?.nombre} {objetoImg && <img src={objetoImg} alt={pokemon.objeto.nombre} width={25} />}</p>

      <h4>Movimientos:</h4>
      {[1, 2, 3, 4].map((n) => {
        const mov = pokemon[`movimiento${n}`];
        return mov ? <p key={n}><strong>Movimiento {n}:</strong> {mov.nombre} (Potencia: {mov.potencia})</p> : null;
      })}

      <h4>IVs</h4>
      <p>PS: {pokemon.ivs.ps} | Ataque: {pokemon.ivs.ataque} | Defensa: {pokemon.ivs.defensa} | At. Esp.: {pokemon.ivs.ataqueEspecial} | Def. Esp.: {pokemon.ivs.defensaEspecial} | Velocidad: {pokemon.ivs.velocidad}</p>

      <h4>EVs</h4>
      <p>PS: {pokemon.evs.ps} | Ataque: {pokemon.evs.ataque} | Defensa: {pokemon.evs.defensa} | At. Esp.: {pokemon.evs.ataqueEspecial} | Def. Esp.: {pokemon.evs.defensaEspecial} | Velocidad: {pokemon.evs.velocidad}</p>

      <h4>Stats Totales (Nivel 100)</h4>
      <p>PS: {pokemon.stats.ps} | Ataque: {pokemon.stats.ataque} | Defensa: {pokemon.stats.defensa} | At. Esp.: {pokemon.stats.ataqueEspecial} | Def. Esp.: {pokemon.stats.defensaEspecial} | Velocidad: {pokemon.stats.velocidad}</p>
    </div>
  );
}
