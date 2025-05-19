const express = require('express');
const ClienteController = require('../controllers/ClienteController');
const router = express.Router();

module.exports = (clienteController) => {
    router.post('/', (req, res) => clienteController.registrar(req, res));
    router.get('/', (req, res) => clienteController.listar(req, res));
    return router;
}