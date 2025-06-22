import { useEffect, useState, useContext } from 'react';
import {
  getObjetos,
  crearObjeto,
  actualizarObjeto,
  eliminarObjeto,
} from '../api/objetos';
import { AuthContext } from '../context/AuthContext';

export default function ObjetosCrud() {
  const { token } = useContext(AuthContext);
  const [objetos, setObjetos] = useState([]);
  const [modalData, setModalData] = useState(null);
  const [imagen, setImagen] = useState(null);
  const [mostrar, setMostrar] = useState(false); // Estado para el pliegue/despliegue

  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await getObjetos(token);
        setObjetos(data);
      } catch (e) {
        console.error('Error al cargar objetos');
      }
    };
    cargar();
  }, [token]);

  const abrirModal = (objeto = null) => {
    setModalData(objeto || { nombre: '', descripcion: '' });
    setImagen(null);
  };

  const cerrarModal = () => {
    setModalData(null);
    setImagen(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const datos = {
      nombre: e.target.nombre.value,
      descripcion: e.target.descripcion.value,
      imagen,
    };
    try {
      if (modalData?.id) {
        await actualizarObjeto(modalData.id, datos, token);
      } else {
        await crearObjeto(datos, token);
      }
      const nuevos = await getObjetos(token);
      setObjetos(nuevos);
      cerrarModal();
    } catch {
      alert('Error al guardar el objeto');
    }
  };

  const handleEliminar = async (id) => {
    if (!confirm('¿Eliminar objeto?')) return;
    try {
      await eliminarObjeto(id, token);
      setObjetos((prev) => prev.filter((o) => o.id !== id));
    } catch {
      alert('Error al eliminar objeto');
    }
  };

  const generarRutaImagen = (nombre) => {
    const nombreArchivo = nombre.toLowerCase().replace(/ /g, '_') + '.png';
    return `http://localhost:3000/Imagenes/Objetos/${nombreArchivo}`;
  };

  return (
    <div>
      <h2
        onClick={() => setMostrar(!mostrar)}
        style={{ cursor: 'pointer', userSelect: 'none' }}
      >
        {mostrar ? '▼ Ocultar' : '▶ Mostrar'} CRUD de Objetos
      </h2>

      {mostrar && (
        <>
          <button onClick={() => abrirModal()}>Crear nuevo objeto</button>

          <ul>
            {objetos.map((obj) => (
              <li key={obj.id}>
                <strong>{obj.nombre}</strong> - {obj.descripcion}
                <img
                  src={generarRutaImagen(obj.nombre)}
                  alt={obj.nombre}
                  width={50}
                  style={{ marginLeft: '10px' }}
                  onError={(e) => (e.target.style.display = 'none')}
                />
                <button onClick={() => abrirModal(obj)}>Editar</button>
                <button onClick={() => handleEliminar(obj.id)}>Eliminar</button>
              </li>
            ))}
          </ul>
        </>
      )}

      {modalData && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>{modalData?.id ? 'Editar Objeto' : 'Nuevo Objeto'}</h3>
            <form onSubmit={handleSubmit}>
              <label>Nombre:</label>
              <input
                name="nombre"
                defaultValue={modalData?.nombre || ''}
                placeholder="Nombre"
                required
              />
              <br />
              <label>Descripción:</label>
              <textarea
                name="descripcion"
                defaultValue={modalData?.descripcion || ''}
                placeholder="Descripción"
              />
              <br />
              <label>Imagen:</label>
              <input
                type="file"
                accept="image/png, image/jpeg"
                onChange={(e) => setImagen(e.target.files[0])}
              />
              <br />
              <div style={{ marginTop: '10px' }}>
                <button type="submit">Guardar</button>
                <button type="button" onClick={cerrarModal}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}