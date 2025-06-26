import AdminEntrenadores from '../components/AdminEntrenadores';
import AdminObjetos from '../components/AdminObjetos';
import AdminMovimientos from '../components/AdminMovimientos';
import AdminPokemonBase from '../components/AdminPokemonBase';
import '../styles/adminPage.css';

export default function AdminPage() {
  return (
    <div className="admin-page">
      <h2 className="admin-titulo">Zona de Administrador</h2>
      <div className="admin-seccion">
        <AdminEntrenadores />
      </div>
      <div className="admin-seccion">
        <AdminObjetos />
      </div>
      <div className="admin-seccion">
        <AdminMovimientos />
      </div>
      <div className="admin-seccion">
        <AdminPokemonBase />
      </div>
    </div>
  );
}
