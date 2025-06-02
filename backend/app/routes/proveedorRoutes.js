// routes/proveedorRoutes.js
const express = require('express');
const router = express.Router();

// Este módulo exporta una FUNCIÓN que recibe el controlador como argumento
module.exports = (proveedorController) => {
    // Asegúrate de que proveedorController sea una instancia válida de ProveedorController
    // y que sus métodos (createProveedor, etc.) sean funciones.
    router.post('/', proveedorController.createProveedor);
    router.get('/', proveedorController.getAllProveedores);
    router.get('/:id', proveedorController.getProveedorById);
    router.put('/:id', proveedorController.updateProveedor);
    router.delete('/:id', proveedorController.deleteProveedor);
    return router;
};
