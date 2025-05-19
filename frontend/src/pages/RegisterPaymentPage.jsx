// src/pages/RegisterPaymentPage.jsx
import React, { useState } from 'react';
import { registerPayment } from '../api';

const RegisterPaymentPage = () => {
  // Estados para los campos del formulario
  const [pedidoId, setPedidoId] = useState('');
  const [monto, setMonto] = useState('');
  const [fecha, setFecha] = useState('');

  // Estados para manejar el feedback al usuario
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones básicas
    if (!pedidoId || !monto || !fecha) {
      setSubmitError(new Error('Por favor, complete todos los campos.'));
      return;
    }
    if (isNaN(monto) || parseFloat(monto) <= 0) {
        setSubmitError(new Error('El monto debe ser un número positivo.'));
        return;
    }

    setIsSubmitting(true);
    setSubmitSuccess(false);
    setSubmitError(null);

    // Prepara los datos del pago basándonos en lo que espera el backend
    const paymentData = {
      pedidoId: parseInt(pedidoId, 10),
      monto: parseFloat(monto),
      fecha: fecha,
    };

    try {
      const newPayment = await registerPayment(paymentData); // Llama a la función de la API
      console.log('Pago registrado:', newPayment);
      setSubmitSuccess(true);
      setPedidoId('');
      setMonto('');
      setFecha('');
    } catch (err) {
      console.error('Error al registrar pago:', err);
      setSubmitError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-4">Registrar Nuevo Pago</h1>
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="pedidoId">
            ID del Pedido
          </label>
          {/* TODO: Idealmente, reemplazar con un selector si hay endpoint GET /api/pedidos */}
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="pedidoId"
            type="number" // Usamos number para que el teclado móvil muestre números
            placeholder="Ingrese ID del Pedido"
            value={pedidoId}
            onChange={(e) => setPedidoId(e.target.value)}
            disabled={isSubmitting}
            required
          />
        </div>
         <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="monto">
            Monto del Pago
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="monto"
            type="number" // Usamos number para permitir decimales y teclado numérico
            step="0.01"   // Permite decimales
            placeholder="Ingrese Monto"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            disabled={isSubmitting}
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="fecha">
            Fecha del Pago
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="fecha"
            type="date" // Input especializado para fechas
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
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
            {isSubmitting ? 'Registrando...' : 'Registrar Pago'}
          </button>
        </div>
        {/* Mensajes de feedback */}
        {submitSuccess && (
          <p className="text-green-500 text-xs italic mt-4">Pago registrado con éxito!</p>
        )}
        {submitError && (
          <p className="text-red-500 text-xs italic mt-4">Error al registrar pago: {submitError.message}</p>
        )}
      </form>
    </div>
  );
};

export default RegisterPaymentPage;