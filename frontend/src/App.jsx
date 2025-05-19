// src/App.jsx - Rutas con autenticación y layout
import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
// Páginas
import LoginPage from './pages/LoginPage';
import ProductListPage from './pages/ProductListPage';
import ClientFormPage from './pages/ClientFormPage';
import CreateOrderPage from './pages/CreateOrderPage';
import RegisterPaymentPage from './pages/RegisterPaymentPage';
import GenerateInvoicePage from './pages/GenerateInvoicePage';
// Layout y Protección
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/Auth/ProtectedRoute'; // Verifica ruta

function App() {
  return (
    <Routes>
      {/* --- Rutas Públicas --- */}
      {/* Login */}
      <Route path="/login" element={<LoginPage />} />

      {/* --- Rutas Protegidas (Requieren Auth y Usan Layout) --- */}
      <Route element={<ProtectedRoute />}> {/* Verifica autenticación */}
        <Route element={<MainLayout />}> {/* Provee el layout */}
          {/* Contenido de estas rutas se renderiza dentro del Layout */}

          {/* Redirige inicio '/' a la página principal protegida */}
          <Route path="/" element={<Navigate to="/productos" replace />} />

          {/* Páginas principales de la aplicación */}
          <Route path="/productos" element={<ProductListPage />} />
          <Route path="/clientes" element={<ClientFormPage />} />
          <Route path="/pedidos/crear" element={<CreateOrderPage />} />
          <Route path="/pagos/registrar" element={<RegisterPaymentPage />} />
          <Route path="/facturas/generar" element={<GenerateInvoicePage />} />

          {/* Otras rutas protegidas aquí */}

        </Route>
      </Route>

      {/* --- Ruta Catch-all (404) --- */}
      <Route path="*" element={
         <div className="text-center mt-10 text-red-600">
            404 - Página no encontrada. <br/>
            <a href="/login" className="text-blue-600 hover:underline">Ir al login</a>
         </div>
      } />

    </Routes>
  );
}

export default App;