import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css'; // Estilos globales
import { BrowserRouter } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext'; // Auth Provider

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider> {/* Provee el contexto de autenticación */}
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);