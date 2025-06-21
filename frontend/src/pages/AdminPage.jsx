import AdminEntrenadores from '../components/AdminEntrenadores';
import AdminObjetos from '../components/AdminObjetos';
export default function AdminPage() {
  return (
    <div>
      <h2>Zona de Administrador</h2>
      <AdminEntrenadores />
      <AdminObjetos />
    </div>
  );
}
