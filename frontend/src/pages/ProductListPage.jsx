import React, { useEffect, useState, useCallback } from 'react';
import { getProducts, createProduct } from '../api';

const ProductListPage = () => {
  // Estado lista productos
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [errorProducts, setErrorProducts] = useState(null);

  // Estado formulario creación producto
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newProductStock, setNewProductStock] = useState('');
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const [createSuccess, setCreateSuccess] = useState(false);
  const [createError, setCreateError] = useState(null);

  // Cargar productos
  const fetchProducts = useCallback(async () => {
    try {
      setLoadingProducts(true);
      setErrorProducts(null);
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      console.error('Error fetching products:', err);
      setErrorProducts(err);
    } finally {
      setLoadingProducts(false); // Finaliza carga
    }
  }, []);

  // Cargar productos al montar
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Enviar formulario creación
  const handleCreateSubmit = async (e) => {
    e.preventDefault();

    // Validaciones básicas
    if (!newProductName.trim() || newProductPrice === '' || newProductStock === '') {
      setCreateError(new Error('Complete todos los campos.'));
      setCreateSuccess(false);
      return;
    }
    const price = parseFloat(newProductPrice);
    const stock = parseInt(newProductStock, 10);

    if (isNaN(price) || price < 0) {
        setCreateError(new Error('Precio no negativo.'));
        setCreateSuccess(false);
        return;
    }
     if (isNaN(stock) || stock < 0) {
        setCreateError(new Error('Stock entero no negativo.'));
        setCreateSuccess(false);
        return;
    }

    // Reinicia feedback formulario
    setIsCreatingProduct(true);
    setCreateSuccess(false);
    setCreateError(null);

    const productData = {
      nombre: newProductName.trim(),
      precio: price,
      stock: stock,
    };

    try {
      // Llama a API para crear producto
      await createProduct(productData);
      console.log('Intento creación producto enviado:', productData);

      // ¡ACTUALIZAR LA LISTA!
      await fetchProducts();

      setCreateSuccess(true);

       // Limpiar formulario
       setNewProductName('');
       setNewProductPrice('');
       setNewProductStock('');

    } catch (err) {
      console.error('Error al crear producto:', err);
      setCreateError(err);
       setCreateSuccess(false);
    } finally {
      setIsCreatingProduct(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Gestión de Productos</h1>

      {/* Formulario Creación */}
       <div className="bg-white shadow-md rounded-lg p-6 mb-8">
           <h2 className="text-xl font-semibold mb-4 text-gray-700">Crear Nuevo Producto</h2>
           <form onSubmit={handleCreateSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="newProductName">
                    Nombre
                  </label>
                  <input
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="newProductName"
                    type="text"
                    placeholder="Nombre del producto"
                    value={newProductName}
                    onChange={(e) => setNewProductName(e.target.value)}
                    disabled={isCreatingProduct}
                    required
                  />
              </div>
               <div>
                   <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="newProductPrice">
                     Precio
                   </label>
                   <input
                     className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                     id="newProductPrice"
                     type="number"
                     step="0.01"
                     placeholder="0.00"
                     value={newProductPrice}
                     onChange={(e) => setNewProductPrice(e.target.value)}
                     disabled={isCreatingProduct}
                     required
                   />
               </div>
                <div>
                   <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="newProductStock">
                     Stock
                   </label>
                   <input
                     className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                     id="newProductStock"
                     type="number"
                     min="0"
                     placeholder="0"
                     value={newProductStock}
                     onChange={(e) => setNewProductStock(e.target.value)}
                     disabled={isCreatingProduct}
                     required
                   />
               </div>
            </div>

            <div className="flex items-center justify-end">
              <button
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:shadow-outline disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out"
                type="submit"
                id = "enviar"
                disabled={isCreatingProduct}
              >
                {isCreatingProduct ? 'Creando...' : 'Crear Producto'}
              </button>
            </div>

            {/* Mensajes feedback formulario */}
            {createSuccess && (
              <p className="text-green-600 text-center text-base font-semibold mt-4">Producto enviado para creación. Reintentando cargar lista...</p>
            )}
            {createError && (
              <p className="text-red-600 text-center text-base font-semibold mt-4">Error al enviar producto: {createError.message}</p>
            )}
           </form>
       </div>

      {/* Listado Productos */}
       <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Listado de Productos</h2>
          {/* Renderizado condicional robusto */}
          {loadingProducts ? (
            <div className="text-center text-blue-500">Cargando productos...</div>
          ) : errorProducts ? (
            <div className="text-center text-red-600">Error al cargar productos: {errorProducts.message}</div>
          ) : Array.isArray(products) && products.length === 0 ? (
            <div className="text-center text-gray-600">No hay productos disponibles.</div>
          ) : Array.isArray(products) && products.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Precio
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    // Usar ID como key
                    <tr key={product?.idProducto ?? `row-${Math.random()}`}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {product?.idProducto}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product?.nombre}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product?.precio !== undefined ? `$${product.precio.toFixed(2)}` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product?.stock !== undefined ? product.stock : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center text-red-500">Error: No se pudieron cargar los productos correctamente. Estado inesperado.</div>
          )}
       </div>
    </div>
  );
};

export default ProductListPage;