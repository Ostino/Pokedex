import { useParams } from 'react-router-dom';

export default function EditEquipo() {
  const { id } = useParams();

  return (
    <div>
      <h2>Editar Equipo</h2>
      <p>Estás editando el equipo con ID: <strong>{id}</strong></p>
      {/* Aquí puedes hacer una llamada para traer info del equipo y permitir editar */}
    </div>
  );
}
