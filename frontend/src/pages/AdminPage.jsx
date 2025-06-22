import AdminEntrenadores from '../components/AdminEntrenadores';
import AdminObjetos from '../components/AdminObjetos';
import AdminMovimientos from '../components/AdminMovimientos'
import AdminPokemonBase from '../components/AdminPokemonBase'
export default function AdminPage() {
  return (
    <div>
      <h2>Zona de Administrador</h2>
      <AdminEntrenadores />
      <AdminObjetos />
      <AdminMovimientos />
      <AdminPokemonBase />
    </div>
  );
}
