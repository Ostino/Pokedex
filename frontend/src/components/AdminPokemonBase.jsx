import { useEffect, useState, useContext } from 'react';
import {
  crearPokemonBase,
  getAllPokemonBase,
  eliminarPokemonBase,
  actualizarPokemonBase,
  verificarNumeroPokedex
} from '../api/pokemonBase';

import {
  getTipos,
  getNaturalezas,
  getHabilidades,
  getMovimientos,
  getObjetos,
} from '../api/pokemonHelpers';

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

  const abrirModal = (poke = null) => {
    setModalData(
      poke || {
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
        imagen: null
      }
    );
  };

  const cerrarModal = () => setModalData(null);

const handleSubmit = async (e) => {
  e.preventDefault();
  const form = e.target;

  // Validaciones (las mismas que ya hicimos antes)
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
  ].map((id) => (id === "" ? null : id));

  const imagenFile = form.imagen?.files?.[0];

  // Validaciones (igual que antes)
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

  try {
    if (modalData.id) {
      await actualizarPokemonBase(modalData.id, datos, token);
    } else {
      await crearPokemonBase(datos, token);
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
    <div>
      <h2>CRUD Pokémon Base</h2>
      <button onClick={() => abrirModal()}>Nuevo Pokémon</button>
<ul>
  {pokemons.map((p) => {
    const nombreImagen = p.nombre.toLowerCase() + '.png'; // o el formato que corresponda
    const urlImagen = `http://localhost:3000/Imagenes/Pokemons/${nombreImagen}`;

    return (
      <li key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <img 
          src={urlImagen} 
          alt={p.nombre} 
          style={{ width: 50, height: 50, objectFit: 'contain' }} 
          onError={(e) => e.target.style.display = 'none'} // oculta la imagen si no carga
        />
        <div>
          <strong>{p.nombre}</strong> #{p.numeroPokedex} | Tipo 1: {p.tipoPrimario?.nombre} | Tipo 2: {p.tipoSecundario?.nombre}
        </div>
        <button onClick={() => abrirModal(p)}>Editar</button>
        <button onClick={() => handleEliminar(p.id)}>Eliminar</button>
      </li>
    );
  })}
</ul>


      {modalData && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>{modalData.id ? 'Editar Pokémon' : 'Nuevo Pokémon'}</h3>
            <form onSubmit={handleSubmit}>
              <input name="numeroPokedex" defaultValue={modalData.numeroPokedex} placeholder="Número Pokédex" required />
              <input name="nombre" defaultValue={modalData.nombre} placeholder="Nombre" required />
              <select name="tipoPrimarioId" defaultValue={modalData.tipoPrimarioId} required>
                <option value="">Tipo Primario</option>
                {tipos.map((t) => (
                  <option key={t.id} value={t.id}>{t.nombre}</option>
                ))}
              </select>
              <select name="tipoSecundarioId" defaultValue={modalData.tipoSecundarioId}>
                <option value="">Tipo Secundario</option>
                {tipos.map((t) => (
                  <option key={t.id} value={t.id}>{t.nombre}</option>
                ))}
              </select>
              <select name="naturalezaId" defaultValue={modalData.naturalezaId} required>
                <option value="">Naturaleza</option>
                {naturalezas.map((n) => (
                  <option key={n.id} value={n.id}>{n.nombre}</option>
                ))}
              </select>
              <select name="habilidadId" defaultValue={modalData.habilidadId} required>
                <option value="">Habilidad</option>
                {habilidades.map((h) => (
                  <option key={h.id} value={h.id}>{h.nombre}</option>
                ))}
              </select>
              <select name="objetoId" defaultValue={modalData.objetoId} >
                <option value="">Objeto</option>
                {objetos.map((o) => (
                  <option key={o.id} value={o.id}>{o.nombre}</option>
                ))}
              </select>
              {[1, 2, 3, 4].map((n) => (
                <select
                  key={n}
                  name={`movimiento${n}Id`}
                  defaultValue={modalData[`movimiento${n}Id`] || ''}
                  
                >
                  <option value="">Movimiento {n}</option>
                  {movimientos.map((m) => (
                    <option key={m.id} value={m.id}>{m.nombre}</option>
                  ))}
                </select>
              ))}
              <input name="imagen" type="file" accept="image/*" />
              <div>
                <button type="submit">Guardar</button>
                <button type="button" onClick={cerrarModal}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
