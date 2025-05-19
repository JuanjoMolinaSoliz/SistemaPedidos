import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (

    <div className="flex flex-col h-full">
      <div className="p-4 text-xl font-bold text-center border-b border-gray-700">
        Gestión Pedidos
      </div>

      <nav className="flex-grow p-4">
        <ul>
          <li className="mb-2">
            <Link to="/productos" className="block py-2 px-4 rounded hover:bg-gray-700">
              Productos
            </Link>
          </li>
          <li className="mb-2">
             <Link to="/clientes" className="block py-2 px-4 rounded hover:bg-gray-700">
              Clientes
            </Link>
          </li>
           <li className="mb-2">
             <Link to="/pedidos/crear" className="block py-2 px-4 rounded hover:bg-gray-700">
              Crear Pedido
            </Link>
          </li>
           <li className="mb-2">
             <Link to="/pagos/registrar" className="block py-2 px-4 rounded hover:bg-gray-700">
              Registrar Pago
            </Link>
          </li>
           <li className="mb-2">
             <Link to="/facturas/generar" className="block py-2 px-4 rounded hover:bg-gray-700">
              Generar Factura
            </Link>
          </li>
        </ul>
      </nav>

      {user && (
        <div className="p-4 border-t border-gray-700">
          <div className="text-center font-semibold">{user.nombre || user.usuario}</div>
          <div className="text-center text-sm text-gray-400">{user.rol}</div>
          <button
            onClick={handleLogout}
            className="mt-4 w-full py-2 px-4 text-sm font-medium rounded-md text-gray-200 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cerrar Sesión
          </button>
        </div>
      )}
    </div>
  );
};

export default Sidebar;