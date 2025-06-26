import { useEffect, useState, useContext } from 'react';
import {
  crearPokemonBase,
  getAllPokemonBase,
  eliminarPokemonBase,
  actualizarPokemonBase,
  verificarNumeroPokedex,
  asignarStatsBase,
  getStats,
  reasignarStatsBase
} from '../api/pokemonBase';

import {
  getTipos,
  getNaturalezas,
  getHabilidades,
  getMovimientos,
  getObjetos,
} from '../api/pokemonHelpers';
import '../styles/pokemonBaseCrud.css';

import { AuthContext } from '../context/AuthContext';

export default function PokemonBaseCrud() {
  const { token } = useContext(AuthContext);
  const [pokemons, setPokemons] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [naturalezas, setNaturalezas] = useState([]);
  const [habilidades, setHabilidades] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [objetos, setObjetos] = useState([]);
  const [modalData, setModalData] = useState(null);
  const [error, setError] = useState(null);
  const [mostrar, setMostrar] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [pkmns, tps, nats, habs, movs, objs] = await Promise.all([
          getAllPokemonBase(token),
          getTipos(token),
          getNaturalezas(token),
          getHabilidades(token),
          getMovimientos(token),
          getObjetos(token)
        ]);
        setPokemons(pkmns);
        setTipos(tps);
        setNaturalezas(nats);
        setHabilidades(habs);
        setMovimientos(movs);
        setObjetos(objs);
      } catch (err) {
        setError('Error cargando datos');
      }
    };
    fetchAll();
  }, [token]);

 const abrirModal = async (poke = null) => {
  if (poke) {
    const stats = poke.statsBase || {};

    setModalData({
      ...poke,
      ps: stats.ps || '',
      ataque: stats.ataque || '',
      defensa: stats.defensa || '',
      ataqueEspecial: stats.ataqueEspecial || '',
      defensaEspecial: stats.defensaEspecial || '',
      velocidad: stats.velocidad || ''
    });
  } else {
    setModalData({
      numeroPokedex: '',
      nombre: '',
      tipoPrimarioId: '',
      tipoSecundarioId: '',
      naturalezaId: '',
      habilidadId: '',
      objetoId: '',
      movimiento1Id: '',
      movimiento2Id: '',
      movimiento3Id: '',
      movimiento4Id: '',
      imagen: null,
      ps: '',
      ataque: '',
      defensa: '',
      ataqueEspecial: '',
      defensaEspecial: '',
      velocidad: '',
    });
  }
};


  const cerrarModal = () => setModalData(null);

  const handleSubmit = async (e) => {
  e.preventDefault();
  const form = e.target;

  const numeroPokedex = form.numeroPokedex.value.trim();
  const nombre = form.nombre.value.trim();
  const tipoPrimarioId = form.tipoPrimarioId.value || null;
  const tipoSecundarioId = form.tipoSecundarioId.value || null;
  const naturalezaId = form.naturalezaId.value;
  const habilidadId = form.habilidadId.value;
  const objetoId = form.objetoId.value || null;

  const movimientosIds = [
    form.movimiento1Id.value || null,
    form.movimiento2Id.value || null,
    form.movimiento3Id.value || null,
    form.movimiento4Id.value || null,
  ].map((id) => (id === '' ? null : id));

  const imagenFile = form.imagen?.files?.[0];

  const ps = form.ps.value.trim();
  const ataque = form.ataque.value.trim();
  const defensa = form.defensa.value.trim();
  const ataqueEspecial = form.ataqueEspecial.value.trim();
  const defensaEspecial = form.defensaEspecial.value.trim();
  const velocidad = form.velocidad.value.trim();

  if (!modalData.id) {
    const res = await verificarNumeroPokedex(numeroPokedex, token);
    if (res.existe) {
      alert("Ese número Pokédex ya está registrado. Elige otro.");
      return;
    }
  }

  if (!nombre) return alert("El nombre es obligatorio.");
  if (!tipoPrimarioId) return alert("Debes seleccionar un tipo primario.");
  if (!naturalezaId) return alert("La naturaleza es obligatoria.");
  if (!habilidadId) return alert("La habilidad es obligatoria.");
  if (!movimientosIds.some((id) => id !== null)) {
    return alert("Debes asignar al menos un movimiento.");
  }
  if (!modalData.id && !imagenFile) {
    return alert("La imagen es obligatoria.");
  }
  if (!ps || !ataque || !defensa || !ataqueEspecial || !defensaEspecial || !velocidad) {
    return alert("Debes ingresar todos los stats base.");
  }

  const datos = {
    numeroPokedex,
    nombre,
    tipoPrimarioId,
    tipoSecundarioId,
    naturalezaId,
    habilidadId,
    objetoId,
    movimiento1Id: movimientosIds[0],
    movimiento2Id: movimientosIds[1],
    movimiento3Id: movimientosIds[2],
    movimiento4Id: movimientosIds[3],
    imagen: imagenFile,
  };

  const stats = {
    ps: Number(ps),
    ataque: Number(ataque),
    defensa: Number(defensa),
    ataqueEspecial: Number(ataqueEspecial),
    defensaEspecial: Number(defensaEspecial),
    velocidad: Number(velocidad),
  };

  try {
    if (modalData.id) {
      await reasignarStatsBase(modalData.id, stats, token);
      await actualizarPokemonBase(modalData.id, datos, token);
    } else {
      const creado = await crearPokemonBase(datos, token);
      await asignarStatsBase(creado.id, stats, token);
    }

    const actualizados = await getAllPokemonBase(token);
    setPokemons(actualizados);
    cerrarModal();
  } catch (err) {
    console.error(err);
    alert("Error al guardar Pokémon");
  }
};


  const handleEliminar = async (id) => {
    if (!confirm('¿Eliminar Pokémon Base?')) return;
    try {
      await eliminarPokemonBase(id, token);
      setPokemons((prev) => prev.filter((p) => p.id !== id));
    } catch {
      alert('Error al eliminar');
    }
  };

  return (
    <div className="pokemonbase-container">
  <h2 className="titulo-seccion" onClick={() => setMostrar(!mostrar)}>
    {mostrar ? '▼ Ocultar' : '▶ Mostrar'} CRUD Pokémon Base
  </h2>

  {mostrar && (
    <>
      <button className="btn btn-nuevo" onClick={() => abrirModal()}>Nuevo Pokémon</button>
      <ul className="lista-pokemons">
        {pokemons.map((p) => {
          const nombreImagen = p.nombre.toLowerCase() + '.png';
          const urlImagen = `http://localhost:3000/Imagenes/Pokemons/${nombreImagen}`;

          return (
            <li key={p.id} className="pokemon-item">
              <img
                src={urlImagen}
                alt={p.nombre}
                className="pokemon-img"
                onError={(e) => (e.target.style.display = 'none')}
              />
              <div className="pokemon-info">
                <strong>{p.nombre}</strong> #{p.numeroPokedex} | Tipo 1: {p.tipoPrimario?.nombre} | Tipo 2: {p.tipoSecundario?.nombre}
              </div>
              <div className="acciones">
                <button className="btn btn-editar" onClick={() => abrirModal(p)}>Editar</button>
                <button className="btn btn-eliminar" onClick={() => handleEliminar(p.id)}>Eliminar</button>
              </div>
            </li>
          );
        })}
      </ul>
    </>
  )}

  {modalData && (
    <div className="modal-overlay">
      <div className="modal">
        <h3>{modalData.id ? 'Editar Pokémon' : 'Nuevo Pokémon'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <input name="numeroPokedex" placeholder="Número Pokédex" defaultValue={modalData.numeroPokedex} required />
            <input name="nombre" placeholder="Nombre" defaultValue={modalData.nombre} required />

            <select name="tipoPrimarioId" defaultValue={modalData.tipoPrimarioId} required>
              <option value="">Tipo Primario</option>
              {tipos.map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
            </select>
            <select name="tipoSecundarioId" defaultValue={modalData.tipoSecundarioId}>
              <option value="">Tipo Secundario</option>
              {tipos.map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
            </select>

            <select name="naturalezaId" defaultValue={modalData.naturalezaId} required>
              <option value="">Naturaleza</option>
              {naturalezas.map((n) => <option key={n.id} value={n.id}>{n.nombre}</option>)}
            </select>

            <select name="habilidadId" defaultValue={modalData.habilidadId} required>
              <option value="">Habilidad</option>
              {habilidades.map((h) => <option key={h.id} value={h.id}>{h.nombre}</option>)}
            </select>

            <select name="objetoId" defaultValue={modalData.objetoId}>
              <option value="">Objeto</option>
              {objetos.map((o) => <option key={o.id} value={o.id}>{o.nombre}</option>)}
            </select>

            {[1, 2, 3, 4].map((n) => (
              <select
                key={n}
                name={`movimiento${n}Id`}
                defaultValue={modalData[`movimiento${n}Id`] || ''}
                required={n === 1}
              >
                <option value="">{`Movimiento ${n}`}</option>
                {movimientos.map((m) => <option key={m.id} value={m.id}>{m.nombre}</option>)}
              </select>
            ))}

            <input name="ps" type="number" placeholder="PS" defaultValue={modalData.ps} required />
            <input name="ataque" type="number" placeholder="Ataque" defaultValue={modalData.ataque} required />
            <input name="defensa" type="number" placeholder="Defensa" defaultValue={modalData.defensa} required />
            <input name="ataqueEspecial" type="number" placeholder="Ataque Especial" defaultValue={modalData.ataqueEspecial} required />
            <input name="defensaEspecial" type="number" placeholder="Defensa Especial" defaultValue={modalData.defensaEspecial} required />
            <input name="velocidad" type="number" placeholder="Velocidad" defaultValue={modalData.velocidad} required />
          </div>

          <input name="imagen" type="file" accept="image/*" />

          <div className="modal-acciones">
            <button type="submit" className="btn btn-guardar">Guardar</button>
            <button type="button" className="btn btn-cancelar" onClick={cerrarModal}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  )}
</div>

  );
}
