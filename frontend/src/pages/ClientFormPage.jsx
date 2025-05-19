// src/pages/ClientFormPage.jsx
import React, { useState } from 'react';
import { createClient } from '../api';

const ClientFormPage = () => {
  // Estados para los campos del formulario
  const [ci, setCi] = useState('');
  const [nombre, setNombre] = useState('');

  //feedback
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsSubmitting(true);
    setSubmitSuccess(false);
    setSubmitError(null);

    const clientData = {
      ci: ci,
      nombre: nombre,
    };

    try {
      const newClient = await createClient(clientData);
      console.log('Cliente creado:', newClient);
      setSubmitSuccess(true);
      setCi('');
      setNombre('');
    } catch (err) {
      console.error('Error al crear cliente:', err);
      setSubmitError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-4">Crear Nuevo Cliente</h1>
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="ci">
            Cédula de Identidad (CI)
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="ci"
            type="text"
            placeholder="Ingrese CI"
            value={ci}
            onChange={(e) => setCi(e.target.value)}
            disabled={isSubmitting}
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="nombre">
            Nombre Completo
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="nombre"
            type="text"
            placeholder="Ingrese Nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            disabled={isSubmitting}
            required
          />
        </div>
        <div className="flex items-center justify-between">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50 disabled:cursor-not-allowed"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Guardando...' : 'Registrar Cliente'}
          </button>
        </div>
        {/* Mensajes de feedback */}
        {submitSuccess && (
          <p className="text-green-500 text-xs italic mt-4">Cliente registrado con éxito!</p>
        )}
        {submitError && (
          <p className="text-red-500 text-xs italic mt-4">Error al registrar cliente: {submitError.message}</p>
        )}
      </form>
    </div>
  );
};

export default ClientFormPage;