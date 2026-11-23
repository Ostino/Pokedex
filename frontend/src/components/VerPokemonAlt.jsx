import { useEffect, useState, useContext } from 'react';
import client from '../api/client';
import { AuthContext } from '../context/AuthContext';
import '../styles/fichaPokemon.css';

const STATS = [
  ['ps', 'PS'],
  ['ataque', 'Ataque'],
  ['defensa', 'Defensa'],
  ['ataqueEspecial', 'At. Esp.'],
  ['defensaEspecial', 'Def. Esp.'],
  ['velocidad', 'Velocidad'],
];

const imagenTipo = (tipo) => (tipo?.imagen ? `/Imagenes/TipoElemento/${tipo.imagen}` : null);

// Ficha con todos los datos de un Pokémon del equipo.
export default function VerPokemon({ id, nombre, onClose }) {
  const [pokemon, setPokemon] = useState(null);
  const [error, setError] = useState(null);
  const { token } = useContext(AuthContext);

  useEffect(() => {
    const fetchPokemon = async () => {
      setPokemon(null);
      setError(null);
      try {
        const response = await client.get(`/pokemonalt/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPokemon(response.data);
      } catch (err) {
        console.error(err);
        setError('No se pudo cargar el Pokémon.');
      }
    };

    fetchPokemon();
  }, [id, token]);

  const botonCerrar = onClose && (
    <button type="button" className="ficha-cerrar" onClick={onClose} aria-label="Cerrar ficha">✕</button>
  );

  if (error) return <div className="ficha ficha--mensaje">{error}{botonCerrar}</div>;
  if (!pokemon) return <div className="ficha ficha--mensaje">Cargando ficha...</div>;

  const pokeImg = pokemon.imagen ? `/Imagenes/Pokemons/${pokemon.imagen}` : null;
  const objetoImg = pokemon.objeto?.imagen ? `/Imagenes/Objetos/${pokemon.objeto.imagen}` : null;
  const movimientos = [1, 2, 3, 4].map((n) => pokemon[`movimiento${n}`]).filter(Boolean);
  const tipos = [pokemon.tipoPrimario, pokemon.tipoSecundario].filter(Boolean);

  return (
    <article className="ficha" aria-label={`Ficha de ${nombre ?? `#${pokemon.numeroPokedex}`}`}>
      <header className="ficha-cabecera">
        {pokeImg && <img src={pokeImg} alt="" className="ficha-img" />}
        <div className="ficha-identidad">
          <span className="ficha-numero">#{String(pokemon.numeroPokedex).padStart(3, '0')}</span>
          <h3 className="ficha-nombre">{nombre ?? 'Pokémon'}</h3>
          <div className="ficha-tipos">
            {tipos.map((tipo) => (
              <span key={tipo.id} className="ficha-tipo">
                {imagenTipo(tipo) && <img src={imagenTipo(tipo)} alt="" />}
                {tipo.nombre}
              </span>
            ))}
          </div>
        </div>
        {botonCerrar}
      </header>

      <div className="ficha-cuerpo">
        <dl className="ficha-datos">
          <div><dt>Naturaleza</dt><dd>{pokemon.naturaleza?.nombre ?? '—'}</dd></div>
          <div><dt>Habilidad</dt><dd>{pokemon.habilidad?.nombre ?? '—'}</dd></div>
          <div>
            <dt>Objeto</dt>
            <dd className="ficha-objeto">
              {objetoImg && <img src={objetoImg} alt="" />}
              {pokemon.objeto?.nombre ?? 'Ninguno'}
            </dd>
          </div>
        </dl>

        <div>
          <h4 className="ficha-subtitulo">Movimientos</h4>
          <ul className="ficha-movimientos">
            {movimientos.map((mov) => (
              <li key={mov.id}>
                <span>{mov.nombre}</span>
                <span className="ficha-potencia">{mov.potencia ?? '—'}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="ficha-tabla-contenedor">
          <h4 className="ficha-subtitulo">Estadísticas (nivel 100)</h4>
          <table className="ficha-tabla">
            <thead>
              <tr><th scope="col">Stat</th><th scope="col">IV</th><th scope="col">EV</th><th scope="col">Final</th></tr>
            </thead>
            <tbody>
              {STATS.map(([clave, etiqueta]) => (
                <tr key={clave}>
                  <th scope="row">{etiqueta}</th>
                  <td>{pokemon.ivs?.[clave] ?? '—'}</td>
                  <td>{pokemon.evs?.[clave] ?? '—'}</td>
                  <td className="ficha-final">{pokemon.stats?.[clave] ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </article>
  );
}
