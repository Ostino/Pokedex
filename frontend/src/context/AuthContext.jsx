import React, { createContext, useState } from 'react';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(sessionStorage.getItem('token') || '');

  const login = (newToken) => {
    setToken(newToken);
    sessionStorage.setItem('token', newToken);
  };

  const logout = () => {
    setToken('');
    sessionStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
