import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Perfil';
import AuthGuard from './components/AuthGuard';
import AdminPage from './pages/AdminPage';
import AdminGuard from './components/AdminGuard';
import EditEquipo from './pages/EditEquipo';
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={ <AuthGuard><Profile /></AuthGuard>}/>
          <Route path="/admin" element={ <AdminGuard><AdminPage /></AdminGuard> }/>
          <Route path="/editar-equipo" element={<AuthGuard><EditEquipo /></AuthGuard>} />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
