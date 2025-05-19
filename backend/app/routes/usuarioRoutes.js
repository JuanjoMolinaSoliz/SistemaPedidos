const express = require('express');
const router = express.Router();

module.exports = (usuarioController) => {
  router.post('/', (req, res) => usuarioController.loginUser(req, res));
  return router;
};