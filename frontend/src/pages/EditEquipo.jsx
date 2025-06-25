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

  // Estado para la naturaleza seleccionada (objeto)
  const [naturalezaSeleccionada, setNaturalezaSeleccionada] = useState(null);
  const [movimientosSeleccionados, setMovimientosSeleccionados] = useState({
  1: null, // movimiento 1
  2: null, // movimiento 2
  3: null,
  4: null,
});
  const [ivs, setIvs] = useState({
    ps: 0,
    ataque: 0,
    defensa: 0,
    ataqueEspecial: 0,
    defensaEspecial: 0,
    velocidad: 0
  });

  const [evs, setEvs] = useState({
    ps: 0,
    ataque: 0,
    defensa: 0,
    ataqueEspecial: 0,
    defensaEspecial: 0,
    velocidad: 0
  });

  const [errorFormulario, setErrorFormulario] = useState('');

  // Cuando se selecciona un pokemon, inicializamos IVs, EVs y naturaleza
  useEffect(() => {
    if (pokemonSeleccionado) {
      setNaturalezaSeleccionada(
        naturalezas.find(n => n.id === pokemonSeleccionado.naturalezaId) || null
      );

      // Si pokemon tiene IVs y EVs guardados, aquí deberías asignarlos, 
      // si no, por defecto 0 (acá inicializamos con 0)
      setIvs({
        ps: 0,
        ataque: 0,
        defensa: 0,
        ataqueEspecial: 0,
        defensaEspecial: 0,
        velocidad: 0
      });

      setEvs({
        ps: 0,
        ataque: 0,
        defensa: 0,
        ataqueEspecial: 0,
        defensaEspecial: 0,
        velocidad: 0
      });

      setErrorFormulario('');
    }
  }, [pokemonSeleccionado, naturalezas]);

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
  
  const calcularStatsFinales = () => {
    if (!pokemonSeleccionado?.statsBase) return null;

    const statsBase = pokemonSeleccionado.statsBase;
    const nat = naturalezaSeleccionada;

    const statsFinales = {};

    const naturalezaMod = (stat) => {
      if (!nat) return 1;
      if (nat.statAumentada === stat) return 1.1;
      if (nat.statReducida === stat) return 0.9;
      return 1;
    };

    for (const stat in statsBase) {
      if (stat === 'id' || stat === 'pokemonBaseId' || stat === 'createdAt' || stat === 'updatedAt') continue;

      const base = statsBase[stat];
      const iv = ivs[stat] ?? 0;
      const ev = evs[stat] ?? 0;

      const statNombre = formatearNombreStat(stat);

      if (stat === 'ps') {
        statsFinales[stat] = Math.floor(((2 * base + iv + ev / 4) * 1) + 110);
      } else {
        const mod = naturalezaMod(statNombre);
        statsFinales[stat] = Math.floor((((2 * base + iv + ev / 4) * 1) + 5) * mod);
      }
    }

    return statsFinales;
  };

  const formatearNombreStat = (clave) => {
    switch (clave) {
      case 'ps': return 'PS';
      case 'ataque': return 'Ataque';
      case 'defensa': return 'Defensa';
      case 'ataqueEspecial': return 'Ataque Especial';
      case 'defensaEspecial': return 'Defensa Especial';
      case 'velocidad': return 'Velocidad';
      default: return clave;
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
            <select
              value={naturalezaSeleccionada?.id || ''}
              onChange={(e) => {
                const id = parseInt(e.target.value);
                const nat = naturalezas.find(n => n.id === id) || null;
                setNaturalezaSeleccionada(nat);
              }}
            >
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

          {[1, 2, 3, 4].map((num) => {
  const movSeleccionado = movimientosSeleccionados[num];

  return (
    <div key={num} style={{ marginTop: '10px' }}>
      <label><strong>Movimiento {num}:</strong></label>
      <select
        value={movSeleccionado?.id || ''}
        onChange={(e) => {
          const id = parseInt(e.target.value);
          const mov = movimientos.find(m => m.id === id) || null;
          setMovimientosSeleccionados(prev => ({ ...prev, [num]: mov }));
        }}
      >
        <option value="">Seleccionar...</option>
        {movimientos.map(m => (
          <option key={m.id} value={m.id}>{m.nombre}</option>
        ))}
      </select>

      {movSeleccionado && (
        <div style={{ marginTop: '5px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span><strong>Potencia:</strong> {movSeleccionado.potencia ?? 'N/A'}</span>

          {/* Imagen del tipo */}
          {movSeleccionado.tipo?.imagen && (
            <img
              src={`http://localhost:3000/Imagenes/TipoElemento/${movSeleccionado.tipo.imagen}`}
              alt={movSeleccionado.tipo.nombre}
              style={{ width: 20, height: 20, imageRendering: 'pixelated', // fuerza render pixel-perfect para sprites pixelados
    objectFit: 'contain', }}
            />
          )}

          {/* Imagen de la categoría de movimiento */}
          {movSeleccionado.categoriamovimiento?.imagen && (
            <img
              src={`http://localhost:3000/Imagenes/TipoAtaque/${movSeleccionado.categoriamovimiento.imagen}`}
              alt={movSeleccionado.categoriamovimiento.nombre}
              style={{ width: 30, height: 30, objectFit: 'contain' }}
            />
          )}
        </div>
      )}
    </div>
  );
})}

          {/* STATS BASE */}
          <div style={{ marginTop: '20px' }}>
            <h4>Estadísticas Base</h4>
            <p><strong>PS:</strong> {pokemonSeleccionado.statsBase?.ps ?? 'N/A'}</p>
            <p><strong>Ataque:</strong> {pokemonSeleccionado.statsBase?.ataque ?? 'N/A'}</p>
            <p><strong>Defensa:</strong> {pokemonSeleccionado.statsBase?.defensa ?? 'N/A'}</p>
            <p><strong>Ataque Especial:</strong> {pokemonSeleccionado.statsBase?.ataqueEspecial ?? 'N/A'}</p>
            <p><strong>Defensa Especial:</strong> {pokemonSeleccionado.statsBase?.defensaEspecial ?? 'N/A'}</p>
            <p><strong>Velocidad:</strong> {pokemonSeleccionado.statsBase?.velocidad ?? 'N/A'}</p>
          </div>

          {/* FORMULARIO IVs */}
          <div style={{ marginTop: '30px' }}>
            <h4>IVs</h4>
            {Object.keys(ivs).map((stat) => (
              <div key={`iv-${stat}`} style={{ marginBottom: '8px' }}>
                <label style={{ textTransform: 'capitalize' }}>{stat}:</label>
                <input
                  type="number"
                  min="0"
                  max="31"
                  value={ivs[stat]}
                  style={{ marginLeft: '10px', width: '60px' }}
                  onChange={(e) => {
                    const val = Math.min(31, Math.max(0, parseInt(e.target.value) || 0));
                    setIvs(prev => ({ ...prev, [stat]: val }));
                  }}
                />
              </div>
            ))}
          </div>

          {/* FORMULARIO EVs */}
          <div style={{ marginTop: '30px' }}>
            <h4>EVs</h4>
            {Object.keys(evs).map((stat) => (
              <div key={`ev-${stat}`} style={{ marginBottom: '8px' }}>
                <label style={{ textTransform: 'capitalize' }}>{stat}:</label>
                <input
                  type="number"
                  min="0"
                  max="252"
                  value={evs[stat]}
                  style={{ marginLeft: '10px', width: '60px' }}
                  onChange={(e) => {
                    const val = Math.min(252, Math.max(0, parseInt(e.target.value) || 0));
                    setEvs(prev => ({ ...prev, [stat]: val }));
                  }}
                />
              </div>
            ))}
          </div>

          {/* ERRORES */}
          {errorFormulario && (
            <p style={{ color: 'red', marginTop: '10px' }}>{errorFormulario}</p>
          )}

          {/* STATS CALCULADAS */}
          {(() => {
            const calculadas = calcularStatsFinales();
            if (!calculadas) return null;

            return (
              <div style={{ marginTop: '30px' }}>
                <h4>Estadísticas Totales (Nivel 100)</h4>
                <p><strong>PS:</strong> {calculadas.ps}</p>
                <p><strong>Ataque:</strong> {calculadas.ataque}</p>
                <p><strong>Defensa:</strong> {calculadas.defensa}</p>
                <p><strong>Ataque Especial:</strong> {calculadas.ataqueEspecial}</p>
                <p><strong>Defensa Especial:</strong> {calculadas.defensaEspecial}</p>
                <p><strong>Velocidad:</strong> {calculadas.velocidad}</p>
              </div>
            );
          })()}

          <button
            style={{ marginTop: '15px', padding: '8px 16px' }}
            onClick={() => {
              // Validar IVs
              for (const key in ivs) {
                const val = ivs[key];
                if (val < 0 || val > 31) {
                  setErrorFormulario(`IV inválido en ${key}: debe estar entre 0 y 31`);
                  return;
                }
              }

              // Validar EVs
              let sumaEVs = 0;
              for (const key in evs) {
                const val = evs[key];
                if (val < 0 || val > 252) {
                  setErrorFormulario(`EV inválido en ${key}: debe estar entre 0 y 252`);
                  return;
                }
                sumaEVs += val;
              }

              if (sumaEVs > 510) {
                setErrorFormulario(`La suma total de EVs no puede superar 510 (actual: ${sumaEVs})`);
                return;
              }

              // Todo correcto
              setErrorFormulario('');
              console.log('Guardar datos:', { ivs, evs, naturaleza: naturalezaSeleccionada });
              alert('Datos válidos. Puedes continuar o enviarlos al backend.');
            }}
          >
            Guardar Pokémon en el equipo
          </button>
        </div>
      )}
    </div>
  );
}
