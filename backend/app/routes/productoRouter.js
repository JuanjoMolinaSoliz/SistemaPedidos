const express = require('express');
const router = express.Router();

module.exports = (productoController) => {

  router.get('/', (req, res) => productoController.listarProductos(req, res));
  router.get('/:id', (req, res) => productoController.obtener(req, res));
  router.post('/productCreate', (req, res) => productoController.crearProducto(req, res));

  return router;
};