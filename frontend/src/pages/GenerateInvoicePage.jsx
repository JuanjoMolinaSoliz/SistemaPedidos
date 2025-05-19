import React, { useState } from 'react';
import { generateInvoicePDF } from '../api';

const GenerateInvoicePage = () => {
  // Estado para el input del ID del pedido
  const [pedidoId, setPedidoId] = useState('');

  // Estados para manejar el feedback
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationSuccess, setGenerationSuccess] = useState(false);
  const [generationError, setGenerationError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar
    if (!pedidoId || parseInt(pedidoId, 10) <= 0) {
      setGenerationError(new Error('Por favor, ingrese un ID de Pedido válido.'));
      return;
    }

    // Reiniciar 
    setIsGenerating(true);
    setGenerationSuccess(false);
    setGenerationError(null);

    try {
      // Llama API
      const response = await generateInvoicePDF(parseInt(pedidoId, 10));

      if (response.ok && response.headers.get('Content-Type') === 'application/pdf') {

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob); 

        const a = document.createElement('a');
        a.href = url;
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = `factura_${pedidoId}.pdf`;
        if (contentDisposition && contentDisposition.indexOf('attachment') !== -1) {
            const filenameMatch = contentDisposition.match(/filename="?([^"]*)"?/);
            if (filenameMatch && filenameMatch[1]) {
                filename = filenameMatch[1];
            }
        }
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);

        setGenerationSuccess(true); // Indica éxito


      } else {
         const errorBody = await response.json();
         const errorMessage = errorBody.detalle || errorBody.error || `Error inesperado (Estado HTTP: ${response.status})`;
         setGenerationError(new Error(errorMessage));
      }

    } catch (err) {
      console.error('Error al generar factura:', err);
      setGenerationError(err); // Guarda el error
    } finally {
      setIsGenerating(false); // Indica que el proceso ha terminado
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Generar Factura PDF</h1>

      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Datos del Pedido</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="pedidoIdFactura">
              ID del Pedido
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="pedidoIdFactura"
              type="number" // Usamos number
              placeholder="Ingrese ID del Pedido"
              value={pedidoId}
              onChange={(e) => setPedidoId(e.target.value)}
              disabled={isGenerating}
              required
            />
          </div>
          <div className="flex items-center justify-end">
            <button
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:shadow-outline disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out"
              type="submit"
              disabled={isGenerating || !pedidoId || parseInt(pedidoId, 10) <= 0} // Deshabilita si está generando o ID no válido
            >
              {isGenerating ? 'Generando...' : 'Generar Factura'}
            </button>
          </div>
          {/* Mensajes de feedback */}
          {generationSuccess && (
            <p className="text-green-600 text-center text-base font-semibold mt-4">Factura generada. Descargando...</p>
          )}
          {generationError && (
            <p className="text-red-600 text-center text-base font-semibold mt-4">Error al generar factura: {generationError.message}</p>
          )}
        </form>
      </div>
    </div>
  );
};

export default GenerateInvoicePage;