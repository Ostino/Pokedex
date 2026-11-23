import { useContext, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
import AvisoDemo from '../components/AvisoDemo';
import {
  IV_MAX, EV_MAX_STAT, EV_MAX_TOTAL, leerNumero, comoNumero, revisarIvsEvs,
} from '../utils/limitesIvsEvs';
import { elegirAlAzar, elegirVariosDistintos, ivsAleatorios, evsAleatorios } from '../utils/aleatorio';
import '../styles/editEquipo.css';

const MAX_POKEMON_EQUIPO = 6;
const STAT_BASE_MAX = 255; // para la barra de estadísticas base
const STATS = ['ps', 'ataque', 'defensa', 'ataqueEspecial', 'defensaEspecial', 'velocidad'];
const statsEnCero = () => Object.fromEntries(STATS.map((stat) => [stat, 0]));
const movimientosVacios = () => ({ 1: null, 2: null, 3: null, 4: null });

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

const imagenPokemon = (archivo) => `/Imagenes/Pokemons/${archivo}`;
const imagenTipo = (tipo) => (tipo?.imagen ? `/Imagenes/TipoElemento/${tipo.imagen}` : null);
const ocultarSiFalla = (e) => { e.currentTarget.style.visibility = 'hidden'; };

function EtiquetaTipo({ tipo }) {
  if (!tipo) return null;
  return (
    <span className="editar-tipo">
      {imagenTipo(tipo) && <img src={imagenTipo(tipo)} alt="" onError={ocultarSiFalla} />}
      {tipo.nombre}
    </span>
  );
}

export default function EditEquipo() {
  const { token } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const { equipo } = location.state || {};
  const panelRef = useRef(null);
  const equipoRef = useRef(null);

  const [pokemonList, setPokemonList] = useState([]);
  const [pokemonsDelEquipo, setPokemonsDelEquipo] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [pokemonSeleccionado, setPokemonSeleccionado] = useState(null);
  const [pokemonVerId, setPokemonVerId] = useState(null);
  const [aviso, setAviso] = useState('');
  const [guardando, setGuardando] = useState(false);

  const [naturalezas, setNaturalezas] = useState([]);
  const [habilidades, setHabilidades] = useState([]);
  const [objetos, setObjetos] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [cargandoDatos, setCargandoDatos] = useState(false);

  const [naturalezaSeleccionada, setNaturalezaSeleccionada] = useState(null);
  const [habilidadSeleccionada, setHabilidadSeleccionada] = useState(null);
  const [objetoSeleccionado, setObjetoSeleccionado] = useState(null);
  const [movimientosSeleccionados, setMovimientosSeleccionados] = useState(movimientosVacios);
  const [ivs, setIvs] = useState(statsEnCero);
  const [evs, setEvs] = useState(statsEnCero);

  // Al elegir otro Pokémon (o al terminar de cargar las naturalezas) el formulario vuelve a empezar.
  useEffect(() => {
    if (pokemonSeleccionado) {
      setNaturalezaSeleccionada(
        naturalezas.find(n => n.id === pokemonSeleccionado.naturalezaId) || null
      );
      setHabilidadSeleccionada(null);
      setObjetoSeleccionado(null);
      setMovimientosSeleccionados(movimientosVacios());
      setIvs(statsEnCero());
      setEvs(statsEnCero());
    }
  }, [pokemonSeleccionado, naturalezas]);

  // El panel de edición está más abajo en la página: se lleva a la vista al abrirlo.
  useEffect(() => {
    if (pokemonSeleccionado) panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [pokemonSeleccionado]);

  const cargarPokemonDelEquipo = async () => {
    try {
      const data = await getPokemonAltPorEquipos(equipo.id, token);
      setPokemonsDelEquipo(data);
    } catch (err) {
      console.error('Error al obtener Pokémon del equipo:', err);
    }
  };

  useEffect(() => {
    if (!equipo) {
      navigate('/profile');
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

    fetchPokemon();
    cargarPokemonDelEquipo();
    // cargarPokemonDelEquipo solo depende de equipo y token, que ya están en la lista.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, equipo, navigate]);

  // Rellena IVs, EVs, habilidad, objeto y movimientos al azar, eligiendo de las mismas listas
  // que ofrecen los selectores. IVs y EVs siempre dentro de los límites (31 / 252 / 510).
  const asignarAleatorio = () => {
    setIvs(ivsAleatorios(STATS));
    setEvs(evsAleatorios(STATS));
    setHabilidadSeleccionada(elegirAlAzar(habilidades));
    setObjetoSeleccionado(elegirAlAzar(objetos));
    const [m1, m2, m3, m4] = elegirVariosDistintos(movimientos, 4);
    setMovimientosSeleccionados({ 1: m1 ?? null, 2: m2 ?? null, 3: m3 ?? null, 4: m4 ?? null });
  };

  const abrirPanelEdicion = async (pokemonBase) => {
    setAviso('');
    setPokemonVerId(null);
    setPokemonSeleccionado(pokemonBase);
    setCargandoDatos(true);
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
    } finally {
      setCargandoDatos(false);
    }
  };

  // Cierra el panel sin guardar nada.
  const cancelarEdicion = () => {
    setPokemonSeleccionado(null);
    equipoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

    for (const stat of STATS) {
      const base = comoNumero(statsBase[stat]);
      // Una casilla vacía o inválida cuenta como 0 (evita NaN o que '' se concatene como texto).
      const iv = comoNumero(ivs[stat]);
      const ev = comoNumero(evs[stat]);

      if (stat === 'ps') {
        statsFinales[stat] = Math.floor(((2 * base + iv + ev / 4) * 1) + 110);
      } else {
        const mod = naturalezaMod(formatearNombreStat(stat));
        statsFinales[stat] = Math.floor((((2 * base + iv + ev / 4) * 1) + 5) * mod);
      }
    }

    return statsFinales;
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este Pokémon del equipo?')) return;

    try {
      await eliminarPokemonAlt(id, token);
      setPokemonsDelEquipo((prev) => prev.filter((p) => p.id !== id));
      if (pokemonVerId === id) setPokemonVerId(null);
    } catch (error) {
      console.error('Error al eliminar el Pokémon:', error);
      alert('No se pudo eliminar el Pokémon. Intenta nuevamente.');
    }
  };

  if (!equipo) return null;

  const revision = revisarIvsEvs(ivs, evs, formatearNombreStat);
  // Lo que exige el backend para guardar, además de IVs y EVs válidos.
  const faltantes = [
    !naturalezaSeleccionada && 'Elige una naturaleza',
    !habilidadSeleccionada && 'Elige una habilidad',
    !movimientosSeleccionados[1] && 'Elige al menos el movimiento 1',
  ].filter(Boolean);
  const problemas = [...faltantes, ...revision.problemas];

  const equipoLleno = pokemonsDelEquipo.length >= MAX_POKEMON_EQUIPO;
  const nombrePorNumero = Object.fromEntries(pokemonList.map((p) => [p.numeroPokedex, p.nombre]));
  const textoBusqueda = busqueda.trim().toLowerCase();
  const listaFiltrada = pokemonList.filter((p) => p.nombre.toLowerCase().includes(textoBusqueda));
  const statsFinales = pokemonSeleccionado ? calcularStatsFinales() : null;
  const huecosLibres = Math.max(0, MAX_POKEMON_EQUIPO - pokemonsDelEquipo.length);

  const guardarPokemon = async () => {
    if (problemas.length > 0 || guardando) return;
    setGuardando(true);
    try {
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

      if (statsFinales) {
        await crearStats({ ...statsFinales, pokemonAltId: pokemonAltCreado.id }, token);
      }

      setAviso(`${pokemonSeleccionado.nombre} se agregó al equipo.`);
      setPokemonSeleccionado(null);
      await cargarPokemonDelEquipo();
      equipoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (err) {
      console.error('Error al guardar Pokémon en el equipo:', err);
      alert(err.response?.data?.detalles || err.response?.data?.error || 'Error al guardar Pokémon en el equipo.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <main className="editar-pagina">
      <AvisoDemo />

      {/* ---------- Cabecera ---------- */}
      <header className="editar-cabecera">
        <div className="editar-cabecera-banda">
          <Link to="/profile" className="editar-volver">← Volver al perfil</Link>
          <span className="editar-etiqueta">Editar equipo</span>
        </div>
        <div className="editar-cabecera-cuerpo">
          <h1 className="editar-titulo">{equipo.nombre}</h1>
          <span className={`editar-contador ${equipoLleno ? 'editar-contador--lleno' : ''}`}>
            {pokemonsDelEquipo.length}/{MAX_POKEMON_EQUIPO} Pokémon
          </span>
        </div>
      </header>

      {/* ---------- Pokémon del equipo ---------- */}
      <section className="editar-seccion" ref={equipoRef} aria-labelledby="editar-equipo-titulo">
        <h2 id="editar-equipo-titulo" className="editar-seccion-titulo">Tu equipo</h2>

        {aviso && <p className="editar-aviso" role="status">{aviso}</p>}

        <ul className="editar-huecos">
          {pokemonsDelEquipo.map((p) => (
            <li key={p.id} className={`editar-hueco ${pokemonVerId === p.id ? 'editar-hueco--activo' : ''}`}>
              <img src={imagenPokemon(p.imagen)} alt="" className="editar-hueco-img" onError={ocultarSiFalla} />
              <span className="editar-hueco-nombre">{nombrePorNumero[p.numeroPokedex] ?? 'Pokémon'}</span>
              <span className="editar-hueco-numero">#{p.numeroPokedex}</span>
              <div className="editar-hueco-botones">
                <button
                  type="button"
                  className="editar-boton editar-boton--primario editar-boton--chico"
                  onClick={() => setPokemonVerId(pokemonVerId === p.id ? null : p.id)}
                  aria-pressed={pokemonVerId === p.id}
                >
                  {pokemonVerId === p.id ? 'Ocultar' : 'Ver'}
                </button>
                <button
                  type="button"
                  className="editar-boton editar-boton--peligro editar-boton--chico"
                  onClick={() => handleEliminar(p.id)}
                >
                  Quitar
                </button>
              </div>
            </li>
          ))}
          {Array.from({ length: huecosLibres }, (_, i) => (
            <li key={`libre-${i}`} className="editar-hueco editar-hueco--libre" aria-label="Hueco libre">
              <span className="editar-pokeball" aria-hidden="true" />
              <span className="editar-hueco-libre-texto">Hueco libre</span>
            </li>
          ))}
        </ul>

        {pokemonVerId && (
          <VerPokemonAlt
            id={pokemonVerId}
            nombre={nombrePorNumero[pokemonsDelEquipo.find((p) => p.id === pokemonVerId)?.numeroPokedex]}
            onClose={() => setPokemonVerId(null)}
          />
        )}
      </section>

      {/* ---------- Pokédex ---------- */}
      <section className="editar-seccion" aria-labelledby="editar-pokedex-titulo">
        <div className="editar-seccion-cabecera">
          <h2 id="editar-pokedex-titulo" className="editar-seccion-titulo">Pokédex</h2>
          <input
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar Pokémon por nombre"
            className="editar-busqueda"
            aria-label="Buscar Pokémon por nombre"
          />
        </div>

        {equipoLleno && (
          <p className="editar-nota">Tu equipo está completo ({MAX_POKEMON_EQUIPO}/{MAX_POKEMON_EQUIPO}). Quita un Pokémon para agregar otro.</p>
        )}

        {listaFiltrada.length === 0 ? (
          <p className="editar-nota">Ningún Pokémon coincide con “{busqueda.trim()}”.</p>
        ) : (
          <ul className="editar-pokedex">
            {listaFiltrada.map((p) => (
              <li
                key={p.id}
                className={`editar-pokedex-item ${pokemonSeleccionado?.id === p.id ? 'editar-pokedex-item--elegido' : ''}`}
              >
                <img
                  src={imagenPokemon(`${p.nombre.toLowerCase()}.png`)}
                  alt=""
                  className="editar-pokedex-img"
                  onError={ocultarSiFalla}
                />
                <div className="editar-pokedex-info">
                  <span className="editar-pokedex-numero">#{String(p.numeroPokedex).padStart(3, '0')}</span>
                  <span className="editar-pokedex-nombre">{p.nombre}</span>
                  <div className="editar-tipos">
                    <EtiquetaTipo tipo={p.tipoPrimario} />
                    <EtiquetaTipo tipo={p.tipoSecundario} />
                  </div>
                </div>
                <button
                  type="button"
                  className="editar-boton editar-boton--primario"
                  onClick={() => abrirPanelEdicion(p)}
                  disabled={equipoLleno}
                  title={equipoLleno ? `Máximo ${MAX_POKEMON_EQUIPO} Pokémon en el equipo` : `Agregar ${p.nombre} al equipo`}
                >
                  Agregar
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ---------- Panel de edición ---------- */}
      {pokemonSeleccionado && (
        <section className="editar-panel" ref={panelRef} aria-labelledby="editar-panel-titulo">
          <div className="editar-panel-cabecera">
            <img
              src={imagenPokemon(`${pokemonSeleccionado.nombre.toLowerCase()}.png`)}
              alt=""
              className="editar-panel-img"
              onError={ocultarSiFalla}
            />
            <div className="editar-panel-identidad">
              <span className="editar-panel-numero">#{String(pokemonSeleccionado.numeroPokedex).padStart(3, '0')}</span>
              <h2 id="editar-panel-titulo" className="editar-panel-titulo">{pokemonSeleccionado.nombre}</h2>
              <div className="editar-tipos">
                <EtiquetaTipo tipo={pokemonSeleccionado.tipoPrimario} />
                <EtiquetaTipo tipo={pokemonSeleccionado.tipoSecundario} />
              </div>
            </div>
            <div className="editar-panel-acciones">
              <button
                type="button"
                className="editar-boton editar-boton--claro"
                onClick={asignarAleatorio}
                disabled={cargandoDatos || movimientos.length === 0}
                title="Asigna IVs, EVs, habilidad, objeto y movimientos al azar"
              >
                <span aria-hidden="true">🎲</span> Aleatorio
              </button>
              <button
                type="button"
                className="editar-boton editar-boton--contorno-claro"
                onClick={cancelarEdicion}
                title="Cerrar sin guardar"
              >
                ✕ Cancelar
              </button>
            </div>
          </div>

          <div className="editar-panel-cuerpo">
            {/* Configuración */}
            <div className="editar-bloque">
              <h3 className="editar-bloque-titulo">Configuración</h3>

              <div className="editar-campo">
                <label htmlFor="editar-naturaleza">Naturaleza</label>
                <select
                  id="editar-naturaleza"
                  value={naturalezaSeleccionada?.id || ''}
                  onChange={(e) => {
                    const id = parseInt(e.target.value);
                    setNaturalezaSeleccionada(naturalezas.find(n => n.id === id) || null);
                  }}
                >
                  <option value="">Seleccionar...</option>
                  {naturalezas.map(n => (
                    <option key={n.id} value={n.id}>{n.nombre}</option>
                  ))}
                </select>
              </div>

              <div className="editar-campo">
                <label htmlFor="editar-habilidad">Habilidad</label>
                <select
                  id="editar-habilidad"
                  value={habilidadSeleccionada?.id || ''}
                  onChange={(e) => {
                    const id = parseInt(e.target.value);
                    setHabilidadSeleccionada(habilidades.find(h => h.id === id) || null);
                  }}
                >
                  <option value="">Seleccionar...</option>
                  {habilidades.map(h => (
                    <option key={h.id} value={h.id}>{h.nombre}</option>
                  ))}
                </select>
              </div>

              <div className="editar-campo">
                <label htmlFor="editar-objeto">Objeto</label>
                <select
                  id="editar-objeto"
                  value={objetoSeleccionado?.id || ''}
                  onChange={(e) => {
                    const id = parseInt(e.target.value);
                    setObjetoSeleccionado(objetos.find(o => o.id === id) || null);
                  }}
                >
                  <option value="">Ninguno</option>
                  {objetos.map(o => (
                    <option key={o.id} value={o.id}>{o.nombre}</option>
                  ))}
                </select>
              </div>

              <h3 className="editar-bloque-titulo editar-bloque-titulo--separado">Movimientos</h3>
              {[1, 2, 3, 4].map((num) => {
                const movSeleccionado = movimientosSeleccionados[num];
                return (
                  <div key={num} className="editar-campo editar-campo--movimiento">
                    <label htmlFor={`editar-movimiento-${num}`}>Movimiento {num}</label>
                    <select
                      id={`editar-movimiento-${num}`}
                      value={movSeleccionado?.id || ''}
                      onChange={(e) => {
                        const id = parseInt(e.target.value);
                        const mov = movimientos.find(m => m.id === id) || null;
                        setMovimientosSeleccionados(prev => ({ ...prev, [num]: mov }));
                      }}
                    >
                      <option value="">{num === 1 ? 'Seleccionar...' : 'Ninguno'}</option>
                      {movimientos.map(m => (
                        <option key={m.id} value={m.id}>{m.nombre}</option>
                      ))}
                    </select>
                    {movSeleccionado && (
                      <div className="editar-movimiento-info">
                        <span>Potencia <strong>{movSeleccionado.potencia ?? '—'}</strong></span>
                        {movSeleccionado.tipo?.imagen && (
                          <img
                            src={`/Imagenes/TipoElemento/${movSeleccionado.tipo.imagen}`}
                            alt={movSeleccionado.tipo.nombre}
                            title={movSeleccionado.tipo.nombre}
                            className="editar-movimiento-tipo"
                          />
                        )}
                        {movSeleccionado.categoriamovimiento?.imagen && (
                          <img
                            src={`/Imagenes/TipoAtaque/${movSeleccionado.categoriamovimiento.imagen}`}
                            alt={movSeleccionado.categoriamovimiento.nombre}
                            title={movSeleccionado.categoriamovimiento.nombre}
                            className="editar-movimiento-categoria"
                          />
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Estadísticas */}
            <div className="editar-bloque">
              <div className="editar-bloque-cabecera">
                <h3 className="editar-bloque-titulo">Estadísticas</h3>
                <p
                  className={`editar-contador-evs ${revision.evsRestantes < 0 ? 'editar-contador-evs--error' : ''}`}
                  aria-live="polite"
                >
                  EVs: usados {revision.totalEvs} de {EV_MAX_TOTAL} ·{' '}
                  {revision.evsRestantes >= 0
                    ? `te quedan ${revision.evsRestantes}`
                    : `te pasaste por ${-revision.evsRestantes}`}
                </p>
              </div>
              <p className="editar-ayuda">
                IVs de 0 a {IV_MAX}. EVs hasta {EV_MAX_STAT} por stat y {EV_MAX_TOTAL} entre todos. Estadísticas finales a nivel 100.
              </p>

              <table className="editar-tabla-stats">
                <thead>
                  <tr>
                    <th scope="col">Stat</th>
                    <th scope="col">Base</th>
                    <th scope="col">IV</th>
                    <th scope="col">EV</th>
                    <th scope="col">Final</th>
                  </tr>
                </thead>
                <tbody>
                  {STATS.map((stat) => {
                    const base = pokemonSeleccionado.statsBase?.[stat];
                    const errorIv = revision.erroresIv[stat];
                    const errorEv = revision.erroresEv[stat];
                    const mod = stat !== 'ps' && naturalezaSeleccionada
                      ? (naturalezaSeleccionada.statAumentada === formatearNombreStat(stat) ? 'sube'
                        : naturalezaSeleccionada.statReducida === formatearNombreStat(stat) ? 'baja' : null)
                      : null;
                    return (
                      <tr key={stat}>
                        <th scope="row">
                          {formatearNombreStat(stat)}
                          {mod && (
                            <span className={`editar-naturaleza-mod editar-naturaleza-mod--${mod}`} title={`La naturaleza ${mod === 'sube' ? 'aumenta' : 'reduce'} esta stat un 10 %`}>
                              {mod === 'sube' ? '▲' : '▼'}
                            </span>
                          )}
                        </th>
                        <td>
                          <div className="editar-base">
                            <span>{base ?? '—'}</span>
                            <span className="editar-barra" aria-hidden="true">
                              <span style={{ width: `${Math.min(100, (comoNumero(base) / STAT_BASE_MAX) * 100)}%` }} />
                            </span>
                          </div>
                        </td>
                        <td>
                          <input
                            id={`iv-${stat}`}
                            type="number"
                            value={ivs[stat]}
                            min={0}
                            max={IV_MAX}
                            aria-label={`IV de ${formatearNombreStat(stat)}`}
                            aria-invalid={!!errorIv}
                            className={errorIv ? 'editar-input-invalido' : ''}
                            onChange={(e) => setIvs((prev) => ({ ...prev, [stat]: leerNumero(e.target.value) }))}
                          />
                          <span className={`editar-pista ${errorIv ? 'editar-pista--error' : ''}`}>
                            {errorIv || `máx. ${IV_MAX}`}
                          </span>
                        </td>
                        <td>
                          <input
                            id={`ev-${stat}`}
                            type="number"
                            value={evs[stat]}
                            min={0}
                            max={EV_MAX_STAT}
                            aria-label={`EV de ${formatearNombreStat(stat)}`}
                            aria-invalid={!!errorEv}
                            className={errorEv ? 'editar-input-invalido' : ''}
                            onChange={(e) => setEvs((prev) => ({ ...prev, [stat]: leerNumero(e.target.value) }))}
                          />
                          <span className={`editar-pista ${errorEv ? 'editar-pista--error' : ''}`}>
                            {errorEv || `máx. ${revision.maxEvPorStat[stat]}`}
                          </span>
                        </td>
                        <td className="editar-final">{statsFinales?.[stat] ?? '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {problemas.length > 0 && (
            <div className="editar-problemas" role="alert">
              <strong>Para guardar, corrige:</strong>
              <ul>
                {problemas.map((problema) => (
                  <li key={problema}>{problema}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="editar-panel-pie">
            <button type="button" className="editar-boton editar-boton--secundario" onClick={cancelarEdicion}>
              Cancelar
            </button>
            <button
              type="button"
              className="editar-boton editar-boton--primario editar-boton--grande"
              disabled={problemas.length > 0 || guardando}
              onClick={guardarPokemon}
            >
              {guardando ? 'Guardando...' : 'Guardar Pokémon en el equipo'}
            </button>
          </div>
        </section>
      )}
    </main>
  );
}
