const express = require('express');
const FacturaController = require('../controllers/FacturaController');
const router = express.Router();

module.exports = (FacturaController) => {
    router.post('/', (req, res) => FacturaController.registrar(req, res));
    return router;
}