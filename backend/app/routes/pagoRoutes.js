const express = require('express');
const router = express.Router();

module.exports = (pagoController) => {
  router.post('/', (req, res) => pagoController.registrar(req, res));
  //router.get('/:pedidoId', (req, res) => pagoController.obtener(req, res));
  return router;
};