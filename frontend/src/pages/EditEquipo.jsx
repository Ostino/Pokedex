import { useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getAllPokemonBase } from '../api/pokemonBase';
import { AuthContext } from '../context/AuthContext';
import { 
  getPokemonAltPorEquipos, 
  crearEVs, 
  crearIVs, 
  crearPokemonAlt,
  crearStats,
  eliminarPokemonAlt
} from '../api/pokemonAlt';
import {
  getNaturalezas,
  getHabilidades,
  getObjetos,
  getMovimientos
} from '../api/pokemonHelpers';
import VerPokemonAlt from '../components/VerPokemonAlt';
import '../styles/editEquipo.css';

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
const [pokemonVerId, setPokemonVerId] = useState(null);

  // Estados para select controlados
  const [naturalezaSeleccionada, setNaturalezaSeleccionada] = useState(null);
  const [habilidadSeleccionada, setHabilidadSeleccionada] = useState(null);
  const [objetoSeleccionado, setObjetoSeleccionado] = useState(null);
  const [movimientosSeleccionados, setMovimientosSeleccionados] = useState({
    1: null,
    2: null,
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

  useEffect(() => {
    if (pokemonSeleccionado) {
      setNaturalezaSeleccionada(
        naturalezas.find(n => n.id === pokemonSeleccionado.naturalezaId) || null
      );

      setHabilidadSeleccionada(null);
      setObjetoSeleccionado(null);

      setMovimientosSeleccionados({
        1: null,
        2: null,
        3: null,
        4: null,
      });

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
        const data = await getPokemonAltPorEquipos(equipo.id, token);
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
  const handleEliminar = async (id) => {
  if (!window.confirm('¿Estás seguro de eliminar este Pokémon del equipo?')) return;

  try {
    await eliminarPokemonAlt(id, token);
    // Actualizar la lista local filtrando el eliminado
    setPokemonsDelEquipo((prev) => prev.filter((p) => p.id !== id));

    // Si estaba viendo ese Pokémon, cerrar el detalle
    if (pokemonVerId === id) {
      setPokemonVerId(null);
    }
  } catch (error) {
    console.error('Error al eliminar el Pokémon:', error);
    alert('No se pudo eliminar el Pokémon. Intenta nuevamente.');
  }
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
  <div className="edit-equipo-container">
    <h2 className="titulo-principal">Editar Equipo</h2>
    <p><strong>ID del equipo:</strong> {equipo.id}</p>
    <p><strong>Nombre actual:</strong> {equipo.nombre}</p>

    <h3 className="subtitulo">Todos los Pokémon Base</h3>
    <div className="busqueda-container">
      <input
        type="text"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        placeholder="Buscar Pokémon por nombre"
        className="input-busqueda"
      />
    </div>

    <ul className="lista-pokemon-base">
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
          <li key={p.id} className="item-pokemon-base">
            <img
              src={urlImagen}
              alt={p.nombre}
              className="img-pokemon-base"
              onError={(e) => (e.target.style.display = 'none')}
            />
            <div className="info-pokemon-base">
              <strong>{p.nombre}</strong> #{p.numeroPokedex} <br />
              <span>Tipo 1: </span>
              {tipo1Img && (
                <img
                  src={tipo1Img}
                  alt={p.tipoPrimario.nombre}
                  className="tipo-elemental-img"
                />
              )}
              {' | '}
              <span>Tipo 2: </span>
              {tipo2Img ? (
                <img
                  src={tipo2Img}
                  alt={p.tipoSecundario?.nombre}
                  className="tipo-elemental-img"
                />
              ) : (
                'Ninguno'
              )}
            </div>
            <button
              className="btn-agregar"
              onClick={() => abrirPanelEdicion(p)}
              disabled={pokemonsDelEquipo.length >= 6}
              title={pokemonsDelEquipo.length >= 6 ? "Máximo 6 Pokémon en el equipo" : "Agregar Pokémon"}
            >
              Editar
            </button>
          </li>
        );
      })}
    </ul>

    <h3 style={{ marginTop: '40px' }}>Pokémon en este equipo</h3>
{pokemonsDelEquipo.length === 0 ? (
  <p>Este equipo no tiene Pokémon asignados.</p>
) : (
  <div className="miniaturas-equipo">
    {pokemonsDelEquipo.map((p) => {
      const nombreImagen = p.imagen;
      const urlImagen = `http://localhost:3000/Imagenes/Pokemons/${nombreImagen}`;

      return (
        <div key={p.id} className="miniatura-card">
          <img
            src={urlImagen}
            alt={p.nombre}
            className="miniatura-img"
            onError={(e) => (e.target.style.display = 'none')}
          />
          <p className="numero-pokedex">#{p.numeroPokedex}</p>
          <div className="miniatura-botones">
            <button onClick={() => setPokemonVerId(p.id)} className="btn-ver">Ver</button>
            <button onClick={() => handleEliminar(p.id)} className="btn-eliminar">Eliminar</button>
          </div>
        </div>
      );
    })}
  </div>
)}


    {pokemonSeleccionado && (
      <div className="panel-edicion">
        <h3>Editar Pokémon: {pokemonSeleccionado.nombre}</h3>
        <p><strong>Número Pokédex:</strong> {pokemonSeleccionado.numeroPokedex}</p>
        <p>
          <strong>Tipo 1:</strong> {pokemonSeleccionado.tipoPrimario?.nombre} |{' '}
          <strong>Tipo 2:</strong> {pokemonSeleccionado.tipoSecundario?.nombre ?? 'Ninguno'}
        </p>

        <div className="campo-select">
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

        <div className="campo-select">
          <label><strong>Habilidad:</strong></label>
          <select
            value={habilidadSeleccionada?.id || ''}
            onChange={(e) => {
              const id = parseInt(e.target.value);
              const h = habilidades.find(h => h.id === id) || null;
              setHabilidadSeleccionada(h);
            }}
          >
            <option value="">Seleccionar...</option>
            {habilidades.map(h => (
              <option key={h.id} value={h.id}>{h.nombre}</option>
            ))}
          </select>
        </div>

        <div className="campo-select">
          <label><strong>Objeto:</strong></label>
          <select
            value={objetoSeleccionado?.id || ''}
            onChange={(e) => {
              const id = parseInt(e.target.value);
              const o = objetos.find(o => o.id === id) || null;
              setObjetoSeleccionado(o);
            }}
          >
            <option value="">Seleccionar...</option>
            {objetos.map(o => (
              <option key={o.id} value={o.id}>{o.nombre}</option>
            ))}
          </select>
        </div>

        {[1, 2, 3, 4].map((num) => {
          const movSeleccionado = movimientosSeleccionados[num];

          return (
            <div key={num} className="campo-select-movimiento">
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
                <div className="info-movimiento">
                  <span><strong>Potencia:</strong> {movSeleccionado.potencia ?? 'N/A'}</span>

                  {movSeleccionado.tipo?.imagen && (
                    <img
                      src={`http://localhost:3000/Imagenes/TipoElemento/${movSeleccionado.tipo.imagen}`}
                      alt={movSeleccionado.tipo.nombre}
                      className="tipo-elemental-img"
                    />
                  )}

                  {movSeleccionado.categoriamovimiento?.imagen && (
                    <img
                      src={`http://localhost:3000/Imagenes/TipoAtaque/${movSeleccionado.categoriamovimiento.imagen}`}
                      alt={movSeleccionado.categoriamovimiento.nombre}
                      className="categoria-movimiento-img"
                    />
                  )}
                </div>
              )}
            </div>
          );
        })}

        <div className="stats-base">
          <h4>Estadísticas Base</h4>
          <p><strong>PS:</strong> {pokemonSeleccionado.statsBase?.ps ?? 'N/A'}</p>
          <p><strong>Ataque:</strong> {pokemonSeleccionado.statsBase?.ataque ?? 'N/A'}</p>
          <p><strong>Defensa:</strong> {pokemonSeleccionado.statsBase?.defensa ?? 'N/A'}</p>
          <p><strong>Ataque Especial:</strong> {pokemonSeleccionado.statsBase?.ataqueEspecial ?? 'N/A'}</p>
          <p><strong>Defensa Especial:</strong> {pokemonSeleccionado.statsBase?.defensaEspecial ?? 'N/A'}</p>
          <p><strong>Velocidad:</strong> {pokemonSeleccionado.statsBase?.velocidad ?? 'N/A'}</p>
        </div>

        <div className="ivs-formulario">
          <h4>IVs</h4>
          {Object.keys(ivs).map((stat) => (
            <div key={`iv-${stat}`} className="campo-iv-ev">
              <label>{formatearNombreStat(stat)}:</label>
              <input
                type="number"
                value={ivs[stat]}
                min={0}
                max={31}
                onChange={(e) =>
                  setIvs((prev) => ({ ...prev, [stat]: parseInt(e.target.value) }))
                }
              />
            </div>
          ))}
        </div>

        <div className="evs-formulario">
          <h4>EVs</h4>
          {Object.keys(evs).map((stat) => (
            <div key={`ev-${stat}`} className="campo-iv-ev">
              <label>{formatearNombreStat(stat)}:</label>
              <input
                type="number"
                value={evs[stat]}
                min={0}
                max={252}
                onChange={(e) =>
                  setEvs((prev) => ({ ...prev, [stat]: parseInt(e.target.value) }))
                }
              />
            </div>
          ))}
        </div>

        <div className="stats-finales">
          <h4>Estadísticas Finales</h4>
          {(() => {
            const finales = calcularStatsFinales();
            return finales ? (
              <ul>
                {Object.entries(finales).map(([stat, valor]) => (
                  <li key={stat}>
                    <strong>{formatearNombreStat(stat)}:</strong> {valor}
                  </li>
                ))}
              </ul>
            ) : (
              <p>Completa IVs, EVs y Naturaleza para ver los stats.</p>
            );
          })()}
        </div>

        <button
          className="btn-guardar-pokemon"
          onClick={async () => {
            try {
              for (const stat in ivs) {
        const val = ivs[stat];
        if (val < 0 || val > 31) {
          alert(`El IV de ${formatearNombreStat(stat)} debe estar entre 0 y 31.`);
          return;
        }
      }

      // VALIDACIONES DE EVs
      let totalEVs = 0;
      for (const stat in evs) {
        const val = evs[stat];
        if (val < 0 || val > 252) {
          alert(`El EV de ${formatearNombreStat(stat)} debe estar entre 0 y 252.`);
          return;
        }
        totalEVs += val;
      }

      if (totalEVs > 510) {
        alert(`La suma total de EVs no puede superar 510 (actual: ${totalEVs}).`);
        return;
      }
              const ivRes = await crearIVs(ivs, token);
              const evRes = await crearEVs(evs, token);

              const pokemonAlt = {
                entrenadorId: equipo.entrenadorId,
                equipoId: equipo.id,
                numeroPokedex: pokemonSeleccionado.numeroPokedex,
                tipoPrimarioId: pokemonSeleccionado.tipoPrimario?.id,
                tipoSecundarioId: pokemonSeleccionado.tipoSecundario?.id || null,
                naturalezaId: naturalezaSeleccionada?.id,
                habilidadId: habilidadSeleccionada?.id || null,
                objetoId: objetoSeleccionado?.id || null,
                movimiento1Id: movimientosSeleccionados[1]?.id || null,
                movimiento2Id: movimientosSeleccionados[2]?.id || null,
                movimiento3Id: movimientosSeleccionados[3]?.id || null,
                movimiento4Id: movimientosSeleccionados[4]?.id || null,
                evsId: evRes.id,
                ivsId: ivRes.id,
                imagen: `${pokemonSeleccionado.nombre.toLowerCase()}.png`,
              };

              const pokemonAltCreado = await crearPokemonAlt(pokemonAlt, token);

              const statsFinales = calcularStatsFinales();
              if (statsFinales) {
                const stats = {
                  ...statsFinales,
                  pokemonAltId: pokemonAltCreado.id,
                };
                await crearStats(stats, token);
              }

              alert('Pokémon agregado al equipo con éxito.');
              window.location.reload();
            } catch (err) {
              console.error('Error al guardar Pokémon en el equipo:', err);
              alert('Error al guardar Pokémon en el equipo.');
            }
          }}
        >
          Guardar Pokémon en el equipo
        </button>
      </div>
    )}

    {pokemonVerId && (
      <div className="ver-pokemon-container">
        <VerPokemonAlt id={pokemonVerId} onClose={() => setPokemonVerId(null)} />
      </div>
    )}
  </div>
);

}