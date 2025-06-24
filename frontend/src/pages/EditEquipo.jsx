import { useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getAllPokemonBase } from '../api/pokemonBase';
import { AuthContext } from '../context/AuthContext';
import { getPokemonAltPorEquipo } from '../api/pokemonAlt';
import {
  getNaturalezas,
  getHabilidades,
  getObjetos,
  getMovimientos
} from '../api/pokemonHelpers';

export default function EditEquipo() {
  const { token } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const { equipo } = location.state || {};

  const [pokemonList, setPokemonList] = useState([]);
  const [pokemonsDelEquipo, setPokemonsDelEquipo] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [pokemonSeleccionado, setPokemonSeleccionado] = useState(null);

  const [naturalezas, setNaturalezas] = useState([]);
  const [habilidades, setHabilidades] = useState([]);
  const [objetos, setObjetos] = useState([]);
  const [movimientos, setMovimientos] = useState([]);

  useEffect(() => {
    if (!equipo) {
      navigate('/perfil');
      return;
    }

    const fetchPokemon = async () => {
      try {
        const data = await getAllPokemonBase(token);
        setPokemonList(data);
      } catch (err) {
        console.error('Error al obtener los Pokémon Base:', err);
      }
    };

    const fetchPokemonDelEquipo = async () => {
      try {
        const data = await getPokemonAltPorEquipo(equipo.id, token);
        setPokemonsDelEquipo(data);
      } catch (err) {
        console.error('Error al obtener Pokémon del equipo:', err);
      }
    };

    fetchPokemon();
    fetchPokemonDelEquipo();
  }, [token, equipo, navigate]);

  const abrirPanelEdicion = async (pokemonBase) => {
    setPokemonSeleccionado(pokemonBase);
    try {
      const [naturalezasData, habilidadesData, objetosData, movimientosData] = await Promise.all([
        getNaturalezas(token),
        getHabilidades(token),
        getObjetos(token),
        getMovimientos(token)
      ]);

      setNaturalezas(naturalezasData);
      setHabilidades(habilidadesData);
      setObjetos(objetosData);
      setMovimientos(movimientosData);
    } catch (err) {
      console.error('Error al cargar datos auxiliares:', err);
    }
  };

  if (!equipo) return null;

  const listaFiltrada = [...pokemonList].sort((a, b) => {
    const nombreBuscado = busqueda.trim().toLowerCase();
    const aCoincide = a.nombre.toLowerCase().includes(nombreBuscado);
    const bCoincide = b.nombre.toLowerCase().includes(nombreBuscado);
    if (aCoincide && !bCoincide) return -1;
    if (!aCoincide && bCoincide) return 1;
    return 0;
  });

  return (
    <div>
      <h2>Editar Equipo</h2>
      <p>ID del equipo: {equipo.id}</p>
      <p>Nombre actual: {equipo.nombre}</p>

      <h3>Todos los Pokémon Base</h3>
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar Pokémon por nombre"
          style={{ padding: '5px', width: '100%', maxWidth: '300px' }}
        />
      </div>

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {listaFiltrada.map((p) => {
          const nombreImagen = p.nombre.toLowerCase() + '.png';
          const urlImagen = `http://localhost:3000/Imagenes/Pokemons/${nombreImagen}`;
          const tipo1Img = p.tipoPrimario?.imagen
            ? `http://localhost:3000/Imagenes/TipoElemento/${p.tipoPrimario.imagen}`
            : null;
          const tipo2Img = p.tipoSecundario?.imagen
            ? `http://localhost:3000/Imagenes/TipoElemento/${p.tipoSecundario.imagen}`
            : null;

          return (
            <li
              key={p.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                border: '1px solid #ccc',
                padding: '10px',
                borderRadius: '8px',
                marginBottom: '10px'
              }}
            >
              <img
                src={urlImagen}
                alt={p.nombre}
                style={{ width: 50, height: 50, objectFit: 'contain' }}
                onError={(e) => (e.target.style.display = 'none')}
              />
              <div style={{ flexGrow: 1 }}>
                <strong>{p.nombre}</strong> #{p.numeroPokedex} <br />
                <span>Tipo 1:</span>{' '}
                {tipo1Img && (
                  <img
                    src={tipo1Img}
                    alt={p.tipoPrimario.nombre}
                    style={{
                      width: 20,
                      height: 20,
                      imageRendering: 'auto',
                      display: 'inline-block',
                      verticalAlign: 'middle'
                    }}
                  />
                )}
                {' | '}
                <span>Tipo 2:</span>{' '}
                {tipo2Img && (
                  <img
                    src={tipo2Img}
                    alt={p.tipoSecundario?.nombre}
                    style={{
                      width: 20,
                      height: 20,
                      imageRendering: 'auto',
                      display: 'inline-block',
                      verticalAlign: 'middle'
                    }}
                  />
                )}
              </div>
              <button onClick={() => abrirPanelEdicion(p)}>➕</button>
            </li>
          );
        })}
      </ul>

      <h3 style={{ marginTop: '40px' }}>Pokémon en este equipo</h3>
      {pokemonsDelEquipo.length === 0 ? (
        <p>Este equipo no tiene Pokémon asignados.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {pokemonsDelEquipo.map((p) => {
            const nombreImagen = p.nombre.toLowerCase() + '.png';
            const urlImagen = `http://localhost:3000/Imagenes/Pokemons/${nombreImagen}`;
            const tipo1Img = p.tipoPrimario?.imagen
              ? `http://localhost:3000/Imagenes/TipoElemento/${p.tipoPrimario.imagen}`
              : null;
            const tipo2Img = p.tipoSecundario?.imagen
              ? `http://localhost:3000/Imagenes/TipoElemento/${p.tipoSecundario.imagen}`
              : null;

            return (
              <li
                key={p.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  border: '1px solid #ccc',
                  padding: '10px',
                  borderRadius: '8px',
                  marginBottom: '10px'
                }}
              >
                <img
                  src={urlImagen}
                  alt={p.nombre}
                  style={{ width: 50, height: 50, objectFit: 'contain' }}
                  onError={(e) => (e.target.style.display = 'none')}
                />
                <div style={{ flexGrow: 1 }}>
                  <strong>{p.nombre}</strong> #{p.numeroPokedex} <br />
                  <span>Tipo 1:</span>{' '}
                  {tipo1Img && (
                    <img
                      src={tipo1Img}
                      alt={p.tipoPrimario?.nombre}
                      style={{
                        width: 20,
                        height: 20,
                        imageRendering: 'auto',
                        display: 'inline-block',
                        verticalAlign: 'middle'
                      }}
                    />
                  )}
                  {' | '}
                  <span>Tipo 2:</span>{' '}
                  {tipo2Img ? (
                    <img
                      src={tipo2Img}
                      alt={p.tipoSecundario?.nombre}
                      style={{
                        width: 20,
                        height: 20,
                        imageRendering: 'auto',
                        display: 'inline-block',
                        verticalAlign: 'middle'
                      }}
                    />
                  ) : (
                    'Ninguno'
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {pokemonSeleccionado && (
        <div
          style={{
            marginTop: '30px',
            padding: '20px',
            border: '2px solid #1976d2',
            borderRadius: '10px',
            backgroundColor: '#f0f8ff'
          }}
        >
          <h3>Editar Pokémon: {pokemonSeleccionado.nombre}</h3>
          <p><strong>Número Pokédex:</strong> {pokemonSeleccionado.numeroPokedex}</p>
          <p>
            <strong>Tipo 1:</strong> {pokemonSeleccionado.tipoPrimario?.nombre} |
            <strong> Tipo 2:</strong> {pokemonSeleccionado.tipoSecundario?.nombre ?? 'Ninguno'}
          </p>

          <div style={{ marginTop: '10px' }}>
            <label><strong>Naturaleza:</strong></label>
            <select>
              <option value="">Seleccionar...</option>
              {naturalezas.map(n => (
                <option key={n.id} value={n.id}>{n.nombre}</option>
              ))}
            </select>
          </div>

          <div style={{ marginTop: '10px' }}>
            <label><strong>Habilidad:</strong></label>
            <select>
              <option value="">Seleccionar...</option>
              {habilidades.map(h => (
                <option key={h.id} value={h.id}>{h.nombre}</option>
              ))}
            </select>
          </div>

          <div style={{ marginTop: '10px' }}>
            <label><strong>Objeto:</strong></label>
            <select>
              <option value="">Seleccionar...</option>
              {objetos.map(o => (
                <option key={o.id} value={o.id}>{o.nombre}</option>
              ))}
            </select>
          </div>

          {[1, 2, 3, 4].map(num => (
            <div key={num}>
              <label><strong>Movimiento {num}:</strong></label>
              <select>
                <option value="">Seleccionar...</option>
                {movimientos.map(m => (
                  <option key={m.id} value={m.id}>{m.nombre}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
