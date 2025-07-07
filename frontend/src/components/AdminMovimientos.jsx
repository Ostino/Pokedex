import { useEffect, useState, useContext } from 'react';
import {
  getMovimientos,
  crearMovimiento,
  actualizarMovimiento,
  eliminarMovimiento,
  getTipos,
  getCategoriasMovimiento,
} from '../api/movimientos';
import { AuthContext } from '../context/AuthContext';
import '../styles/movimientosCrud.css';

export default function MovimientosCrud() {
  const { token } = useContext(AuthContext);
  const [movimientos, setMovimientos] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [modalData, setModalData] = useState(null);
  const [mostrar, setMostrar] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [movs, tps, cats] = await Promise.all([
          getMovimientos(token),
          getTipos(token),
          getCategoriasMovimiento(token),
        ]);
        console.log('Todos los tipos', tps);
        console.log('Todos los tipos de movimientos', cats);
        setMovimientos(movs);
        console.log('Movimientos recibidos:', movs);
        setTipos(tps);
        setCategorias(cats);
      } catch (err) {
        console.error('Error cargando datos:', err);
      }
    };
    fetchData();
  }, [token]);

  const abrirModal = (mov = null) => {
    setModalData(
      mov || {
        nombre: '',
        tipoId: '',
        potencia: '',
        pp: '',
        precision: '',
        categoriaMovimientoId: '',
      }
    );
  };

  const cerrarModal = () => setModalData(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const datos = {
      nombre: form.nombre.value,
      tipoId: form.tipoId.value,
      potencia: form.potencia.value,
      pp: form.pp.value,
      precision: form.precision.value,
      categoriaMovimientoId: form.categoriaMovimientoId.value,
    };
    console.log("Se esta por subir este movimiento", datos);
    try {
      if (modalData.id) {
        await actualizarMovimiento(modalData.id, datos, token);
      } else {
        await crearMovimiento(datos, token);
      }
      const nuevos = await getMovimientos(token);
      setMovimientos(nuevos);
      cerrarModal();
    } catch (err) {
      alert('Error al guardar movimiento');
    }
  };

  const handleEliminar = async (id) => {
    if (!confirm('¿Eliminar movimiento?')) return;
    try {
      await eliminarMovimiento(id, token);
      setMovimientos((prev) => prev.filter((m) => m.id !== id));
    } catch {
      alert('Error al eliminar');
    }
  };

  const getTipoImagen = (imagen) =>
    `http://localhost:3000/Imagenes/Tipos/${imagen}`;
  const getCategoriaImagen = (imagen) =>
    `http://localhost:3000/Imagenes/Categorias/${imagen}`;

  return (
    <div className="movimientos-container">
  <h2 className="movimientos-titulo" onClick={() => setMostrar(!mostrar)}>
    {mostrar ? '▼ Ocultar' : '▶ Mostrar'} CRUD de Movimientos
  </h2>

  {mostrar && (
    <>
      <button className="btn btn-nuevo" onClick={() => abrirModal()}>
        Nuevo Movimiento
      </button>

      <ul className="lista-movimientos">
        {movimientos.map((mov) => (
          <li key={mov.id} className="item-movimiento">
            <strong>{mov.nombre}</strong> | Tipo: {mov.tipo?.nombre} | Cat: {mov.categoriamovimiento?.nombre} | Pot: {mov.potencia} | PP: {mov.pp} | Prec: {mov.precision}
            <div className="acciones">
              <button className="btn btn-editar" onClick={() => abrirModal(mov)}>Editar</button>
              <button className="btn btn-eliminar" onClick={() => handleEliminar(mov.id)}>Eliminar</button>
            </div>
          </li>
        ))}
      </ul>
    </>
  )}

  {modalData && (
    <div className="modal-overlay">
      <div className="modal">
        <h3>{modalData.id ? 'Editar Movimiento' : 'Nuevo Movimiento'}</h3>
        <form onSubmit={handleSubmit}>
          <input name="nombre" placeholder="Nombre" defaultValue={modalData.nombre} required />
          <select name="tipoId" defaultValue={modalData.tipoId?.toString() || ''} required>
            <option value="">Tipo</option>
            {tipos.map((t) => (
              <option key={t.id} value={t.id.toString()}>{t.nombre}</option>
            ))}
          </select>

          {!modalData.id && modalData.tipoId && (
            <img
              className="imagen-tipo"
              src={getTipoImagen(tipos.find((t) => t.id == modalData.tipoId)?.imagen)}
              alt="tipo"
              width={50}
            />
          )}

          <select name="categoriaMovimientoId" defaultValue={modalData.categoriaMovimientoId?.toString() || ''} required>
            <option value="">Categoría</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id.toString()}>{c.nombre}</option>
            ))}
          </select>

          {!modalData.id && modalData.categoriaMovimientoId && (
            <img
              className="imagen-categoria"
              src={getCategoriaImagen(categorias.find((c) => c.id == modalData.categoriaMovimientoId)?.imagen)}
              alt="cat"
              width={50}
            />
          )}

          <input name="potencia" type="number" placeholder="Potencia" defaultValue={modalData.potencia} required/>
          <input name="pp" type="number" placeholder="PP" defaultValue={modalData.pp} required/>
          <input name="precision" type="number" placeholder="Precisión" defaultValue={modalData.precision} required />

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