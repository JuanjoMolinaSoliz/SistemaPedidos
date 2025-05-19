const express = require('express');
const router = express.Router();

module.exports = (pedidoController) => {
  router.post('/', (req, res) => pedidoController.crearPedido(req, res));
  //router.get('/:id', (req, res) => pedidoController.obtener(req, res));
  return router;
};