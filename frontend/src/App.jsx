import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Perfil';
import AuthGuard from './components/AuthGuard';
import AdminPage from './pages/AdminPage';
import AdminGuard from './components/AdminGuard';
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          {/* Ruta protegida usando AuthGuard */}
          <Route path="/profile" element={ <AuthGuard><Profile /></AuthGuard>}/>
          <Route path="/admin" element={ <AdminGuard><AdminPage /></AdminGuard> }/>
          {/* Redirección raíz */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
