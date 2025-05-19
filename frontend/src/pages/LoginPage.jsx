import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// --- ¡IMPORTA useAuth! ---
import { useAuth } from '../context/AuthContext';


const LoginPage = () => {
  // Estados para los campos del formulario
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');

  // Estados para el feedback al usuario
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Hook para navegación programática
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

   useEffect(() => {
     if (isAuthenticated) {
       navigate('/productos');
     }
   }, [isAuthenticated, navigate]);


  const handleSubmit = async (e) => {
    e.preventDefault();

    setError(null);
    setLoading(true);

    try {
      const userData = await login(usuario, password);

      console.log('Login exitoso (manejado por Context):', userData);

    } catch (err) {
      console.error('Error durante el login (contexto):', err);
      setError(err.message || 'Error desconocido al intentar iniciar sesión.');
    } finally {
      setLoading(false);
    }
  };

   if (isAuthenticated) {
     return null;
   }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-900">
          Iniciar Sesión
        </h2>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="usuario" className="block text-sm font-medium text-gray-700">
              Usuario o Email
            </label>
            <input
              id="usuario"
              name="usuario"
              type="text"
              required
              className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="Tu usuario o email"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              disabled={loading} // Deshabilitar inputs mientras carga
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading} // Deshabilitar inputs mientras carga
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 text-center">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out"
              disabled={loading}
            >
              {loading ? 'Iniciando Sesión...' : 'Iniciar Sesión'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;