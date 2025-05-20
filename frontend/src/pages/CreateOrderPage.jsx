// src/pages/CreateOrderPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { getClients, getProducts, createOrder } from '../api';

const CreateOrderPage = () => {
  // stados de Carga y Error para Clientes y Productos
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [errorClients, setErrorClients] = useState(null);
  const [errorProducts, setErrorProducts] = useState(null);

  // Estado del Formulario de Pedido
  const [selectedClient, setSelectedClient] = useState('');
  // Array PEDIDO
  const [orderItems, setOrderItems] = useState([]);

  // Estado para manejar las cantidades de los inputs de producto
  const [productQuantities, setProductQuantities] = useState({});

  // Estado de Envío del Pedido
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [orderSubmitSuccess, setOrderSubmitSuccess] = useState(false);
  const [orderSubmitError, setOrderSubmitError] = useState(null);

  // Estado para el total del pedido
  const [orderTotal, setOrderTotal] = useState(0);

  // Efecto para cargar Clientes y Productos al montar el componente
  useEffect(() => {
    const fetchData = async () => {
      // Cargar Clientes
      try {
        const clientsData = await getClients();
        setClients(clientsData);
      } catch (err) {
        setErrorClients(err);
      } finally {
        setLoadingClients(false);
      }

      // Cargar Productos
      try {
        const productsData = await getProducts();
        setProducts(productsData);
      } catch (err) {
        setErrorProducts(err);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchData();
  }, []);

  // calcular el total
  const calculateOrderTotal = useCallback(() => {
    const newTotal = orderItems.reduce((acc, item) => acc + (item.cantidad * item.precio), 0);
    setOrderTotal(newTotal);
  }, [orderItems]);

  // recalcular
  useEffect(() => {
    calculateOrderTotal();
  }, [orderItems, calculateOrderTotal]);

  // actualizar el estado
  const handleQuantityChange = (idProducto, value) => {
    const quantity = value === '' ? '' : Math.max(1, parseInt(value, 10));

    setProductQuantities({
      ...productQuantities,
      [idProducto]: quantity,
    });
  };

  // añadir un producto al pedido
  const handleAddItem = (productToAdd) => {
    // Obtener la cantidad del estado
    const cantidadStr = productQuantities[productToAdd.idProducto];
    const cantidad = parseInt(cantidadStr, 10);

    // Validar que la cantidad sea un número válido, positivo y no exceda el stock
    if (isNaN(cantidad) || cantidad <= 0) {
      setOrderSubmitError(new Error('Por favor, ingrese una cantidad válida (> 0).'));
      return;
    }
    if (cantidad > productToAdd.stock) {
        setOrderSubmitError(new Error(`La cantidad solicitada (${cantidad}) excede el stock disponible (${productToAdd.stock}).`));
        return;
    }

    // Buscar si el producto ya está en el pedido
    const existingItemIndex = orderItems.findIndex(item => item.idProducto === productToAdd.idProducto);

    if (existingItemIndex > -1) {
      const updatedItems = [...orderItems];
      updatedItems[existingItemIndex].cantidad += cantidad;
      setOrderItems(updatedItems);
    } else {
      setOrderItems([...orderItems, {
        idProducto: productToAdd.idProducto,
        nombre: productToAdd.nombre,
        cantidad: cantidad,
        precio: productToAdd.precio
      }]);
    }
ºººººººººººººº
    // Limpiar el input
    setProductQuantities({
      ...productQuantities,
      [productToAdd.idProducto]: '',
    });
    setOrderSubmitError(null);

  };

  // remover
  const handleRemoveItem = (idProductoToRemove) => {
    const updatedItems = orderItems.filter(item => item.idProducto !== idProductoToRemove);
    setOrderItems(updatedItems);

  };

  // editar la cantidad
  const handleEditQuantity = (idProducto, newCantidad) => {
    const cantidad = parseInt(newCantidad, 10);
    if (isNaN(cantidad) || cantidad <= 0) {
       setOrderSubmitError(new Error('La cantidad debe ser un número positivo.'));
       return;
    }
    // TODO: Opcional: Añadir validación contra stock aquí también al editar

    // Busca el ítem a actualizar
    const updatedItems = orderItems.map(item =>
      item.idProducto === idProducto ?
      { ...item, cantidad: cantidad }
      :
      item
    );
    setOrderItems(updatedItems);

    // recalcula
     setOrderSubmitError(null);
  };


  // enviar el pedido
  const handleSubmitOrder = async (e) => {
    e.preventDefault();

    if (!selectedClient) {
      setOrderSubmitError(new Error('Por favor, seleccione un cliente.'));
      return;
    }
    if (orderItems.length === 0) {
      setOrderSubmitError(new Error('El pedido debe contener al menos un producto.'));
      return;
    }
    // TODO: Opcional: Añadir validación de stock final antes de enviar si es crítica


    setIsSubmittingOrder(true);
    setOrderSubmitSuccess(false);
    setOrderSubmitError(null);

    const orderData = {
      fecha: new Date().toISOString().split('T')[0],
      idCliente: parseInt(selectedClient, 10),
      detalles: orderItems.map(item => ({
        idProducto: item.idProducto,
        cantidad: item.cantidad,
        precio: item.precio
      })),
    };

    try {
      const result = await createOrder(orderData);
      console.log('Respuesta del backend al crear pedido:', result);
      setOrderSubmitSuccess(true);

      // Limpiar
      setSelectedClient('');
      setOrderItems([]);
      setProductQuantities({});

    } catch (err) {
      console.error('Error al crear pedido:', err);
      setOrderSubmitError(err);
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Crear Nuevo Pedido</h1>

      {/* Sección de Selección de Cliente */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Seleccionar Cliente</h2>
        {loadingClients ? (
          <div className="text-center text-blue-500">Cargando clientes...</div>
        ) : errorClients ? (
          <div className="text-center text-red-500">Error al cargar clientes: {errorClients.message}</div>
        ) : clients.length === 0 ? (
           <div className="text-center text-gray-600">No hay clientes disponibles. Por favor, cree uno primero.</div>
        ) : (
          <select
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm"
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
            disabled={isSubmittingOrder}
            required
          >
            <option value="">-- Seleccione un cliente --</option>
            {clients.map(client => (
              <option key={client.idCliente} value={client.idCliente}>
                {client.nombre} (CI: {client.ci})
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Sección de Añadir Productos al Pedido */}
       <div className="bg-white shadow-md rounded-lg p-6 mb-6">
         <h2 className="text-xl font-semibold mb-4 text-gray-700">Añadir Productos</h2>
         {loadingProducts ? (
           <div className="text-center text-blue-500">Cargando productos...</div>
         ) : errorProducts ? (
           <div className="text-center text-red-500">Error al cargar productos: {errorProducts.message}</div>
         ) : products.length === 0 ? (
            <div className="text-center text-gray-600">No hay productos disponibles.</div>
         ) : (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {products.map(product => (
               <div key={product.idProducto} className="border border-gray-200 rounded-lg p-4 shadow-sm bg-gray-50 flex flex-col justify-between">
                 <div>
                    <h3 className="text-lg font-bold text-gray-800">{product.nombre}</h3>
                    <p className="text-gray-600 text-sm">Precio: <span className="font-semibold">${product.precio.toFixed(2)}</span></p>
                    <p className="text-gray-600 text-sm">Stock: <span className="font-semibold">{product.stock}</span></p>
                 </div>


                 {/* Cantidad y Botón Añadir */}
                 <div className="mt-4 flex items-center">
                    <label htmlFor={`qty-${product.idProducto}`} className="mr-2 text-sm font-medium text-gray-700">Cantidad:</label>
                    <input
                       id={`qty-${product.idProducto}`}
                       type="number"
                       min="1"
                       value={productQuantities[product.idProducto] || ''} 
                       onChange={(e) => handleQuantityChange(product.idProducto, e.target.value)}
                       className="w-20 px-3 py-2 border border-gray-300 rounded-md text-gray-700 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                       disabled={isSubmittingOrder || product.stock <= 0}
                    />
                     <button
                        className="ml-3 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md focus:outline-none focus:shadow-outline disabled:opacity-50 disabled:cursor-not-allowed text-sm transition duration-150 ease-in-out"
                        onClick={() => handleAddItem(product)}
                        disabled={
                           isSubmittingOrder ||
                           product.stock <= 0 ||
                           !productQuantities[product.idProducto] ||
                           parseInt(productQuantities[product.idProducto], 10) <= 0 ||
                           parseInt(productQuantities[product.idProducto], 10) > product.stock
                        }
                      >
                        Añadir
                      </button>
                 </div>
                 {/* Muestra feedback si la cantidad excede stock al intentar añadir */}
                 {productQuantities[product.idProducto] > product.stock && (
                     <p className="text-red-500 text-xs mt-1">Cantidad excede stock disponible.</p>
                 )}
               </div>
             ))}
           </div>
         )}
       </div>


      {/* Sección de Resumen del Pedido*/}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Resumen del Pedido</h2>
        {orderItems.length === 0 ? (
          <div className="text-center text-gray-600">Aún no ha añadido productos al pedido.</div>
        ) : (
          <div className="overflow-x-auto">
             <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                   <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                         Producto
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                         Cantidad
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                         Precio Unit.
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                         Subtotal
                      </th>
                      <th scope="col" className="relative px-6 py-3">
                         <span className="sr-only">Eliminar</span>
                      </th>
                   </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                   {orderItems.map((item) => (
                      <tr key={item.idProducto}>
                         <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {item.nombre}
                         </td>
                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                             <input
                                type="number"
                                min="1"
                                value={item.cantidad}
                                onChange={(e) => handleEditQuantity(item.idProducto, e.target.value)}
                                className="w-20 px-3 py-1 border border-gray-300 rounded-md text-gray-700 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                disabled={isSubmittingOrder}
                             />
                         </td>
                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ${item.precio.toFixed(2)}
                         </td>
                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ${(item.cantidad * item.precio).toFixed(2)} {/* Calcula subtotal aquí */}
                         </td>
                         <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                               className="text-red-600 hover:text-red-900 focus:outline-none focus:underline transition duration-150 ease-in-out"
                               onClick={() => handleRemoveItem(item.idProducto)}
                               disabled={isSubmittingOrder}
                            >
                               Eliminar
                            </button>
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
             {/* Sección del Total */}
             <div className="mt-4 pt-4 border-t border-gray-200 text-right">
                <span className="text-lg font-bold text-gray-800">Total del Pedido:</span>{' '}
                <span className="text-xl font-extrabold text-blue-600">${orderTotal.toFixed(2)}</span> {/* Muestra el total calculado */}
             </div>
          </div>
        )}
      </div>

      {/* ... Sección de Envío del Pedido ... */}
       <form onSubmit={handleSubmitOrder} className="bg-white shadow-md rounded-lg p-6">
           <div className="flex items-center justify-end">
             <button
               className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:shadow-outline disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out"
               type="submit"
               disabled={isSubmittingOrder || !selectedClient || orderItems.length === 0}
             >
               {isSubmittingOrder ? 'Creando Pedido...' : 'Confirmar Pedido'}
             </button>
           </div>
           {/* Mensajes de feedback del envío del pedido */}
           {orderSubmitSuccess && (
             <p className="text-green-600 text-center text-base font-semibold mt-4">¡Pedido creado con éxito!</p>
           )}
           {orderSubmitError && (
             <p className="text-red-600 text-center text-base font-semibold mt-4">Error al crear pedido: {orderSubmitError.message}</p>
           )}
        </form>

    </div>
  );
};

export default CreateOrderPage;