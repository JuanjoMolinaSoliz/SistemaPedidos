import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar.jsx';

const MainLayout = () => {
  return (
    // Contenedor principal
    <div className="flex min-h-screen bg-gray-100">

      {/* Contenedor del Sidebar*/}
      <div className="w-64 fixed left-0 top-0 h-screen z-30 bg-gray-800 text-white">
        <Sidebar />
      </div>

      {/* Área de Contenido Principal*/}
      <div className="flex-1 ml-64 overflow-y-auto">
         <div className="p-6">
            <Outlet />
         </div>
      </div>
    </div>
  );
};

export default MainLayout;