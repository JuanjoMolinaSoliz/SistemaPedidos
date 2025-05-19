import React, { createContext, useState, useContext, useEffect } from 'react';
import { loginUser } from '../api';

// 1. Crear el Contexto de Autenticación
const AuthContext = createContext(null);

// 2. Crear un Proveedor de Autenticación
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loadingInitial, setLoadingInitial] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('authenticatedUser');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Error parsing user from localStorage:", error);
        localStorage.removeItem('authenticatedUser');
        setUser(null);
      }
    }
    setLoadingInitial(false);
  }, []);

  // Función para manejar el proceso de login
  const login = async (usuario, password) => {
    try {
      const userData = await loginUser({ usuario, password });

      setUser(userData);
      localStorage.setItem('authenticatedUser', JSON.stringify(userData));

      return userData;

    } catch (error) {
      console.error('Login failed in AuthContext:', error);
      logout();
      throw error; 
    }
  };

  // Función para manejar el logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem('authenticatedUser');
  };

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    loadingInitial
  };

   if (loadingInitial) {
     return <div>Cargando sesión...</div>;
   }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// 3. Crear un Hook personalizado para usar el Contexto de Autenticación
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};