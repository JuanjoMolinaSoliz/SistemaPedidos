// "use client";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Función genérica para manejar peticiones
async function request(endpoint, options = {}) {
  const fullUrl = `${API_BASE_URL}${endpoint}`;
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };
  const mergedOptions = { ...defaultOptions, ...options };

  try {
    const response = await fetch(fullUrl, mergedOptions);
    if (response.status === 204 || response.status === 304) {
        console.log(`Request to ${fullUrl} returned status ${response.status}. No content.`);
        return [];
    }

    // 400, 401, 404, 500
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        if (errorData && errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData && errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData) {
           errorMessage = JSON.stringify(errorData);
        }
      } catch (e) {
        console.warn(`Could not parse error response body as JSON for ${fullUrl}:`, e);
      }
      const httpError = new Error(errorMessage);
      httpError.status = response.status;
      throw httpError;
    }

    try {
         return await response.json();
    } catch (e) {
        console.error(`Error parsing JSON response from ${fullUrl}:`, e);
        return null;
    }

  } catch (error) {
    console.error(`Network or processing error during API request to ${fullUrl}:`, error);
    throw error;
  }
}

// --- Endpoints para Clientes ---
export const createClient = async (clientData) => {
  return request('/clientes', {
    method: 'POST',
    body: JSON.stringify(clientData),
  });
};

export const getClients = async () => {
  return request('/clientes', {
    method: 'GET',
  });
};


// --- Endpoints para Productos ---
export const getProducts = async () => {
    // 200, 204, 304, 404, 500
    return request('/productos', {
      method: 'GET',
    });
};

// Endpoint POST
export const createProduct = async (productData) => {
  return request('/productos/productCreate', {
    method: 'POST',
    body: JSON.stringify(productData),
  });
};


// --- Endpoints para Pedidos ---
// Endpoint POST
export const createOrder = async (orderData) => {
  return request('/pedidos', {
    method: 'POST',
    body: JSON.stringify(orderData),
  });
};

// --- Endpoints para Facturas ---
// Endpoint POST
export const generateInvoicePDF = async (idPedido) => {
  const response = await fetch(`${API_BASE_URL}/facturas`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ idPedido }),
  });

   if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
            const errorData = await response.json();
            if (errorData && errorData.detalle) { 
                errorMessage = errorData.detalle;
            } else if (errorData && errorData.error) { 
                 errorMessage = errorData.error;
            } else if (errorData) { 
                 errorMessage = JSON.stringify(errorData);
            }
        } catch (e) {
             console.warn(`Could not parse error response body as JSON for invoice generation error ${response.status}:`, e);
        }
        const httpError = new Error(errorMessage);
        httpError.status = response.status;
        throw httpError; // Lanza el error construido
    }

  return response;
};


// --- Endpoints para Pagos ---
// Endpoint POST
export const registerPayment = async (paymentData) => {
  return request('/pagos', {
    method: 'POST',
    body: JSON.stringify(paymentData),
  });
};

// --- Endpoint para Autenticación (Login) ---
/**
 * @param {object} credentials
 * @param {string} credentials.usuario
 * @param {string} credentials.password 
 * @returns {Promise<object>}
 * @throws {Error}
 */
export const loginUser = async (credentials) => {
  return request('/auth', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
};
