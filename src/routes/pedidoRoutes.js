const express = require('express');
const router = express.Router();
const pedidoController = require('../controllers/pedidoController');
const authMiddleware = require('../middlewares/authMiddleware');

// A rota exige autenticação prévia
router.post('/', authMiddleware, pedidoController.criarPedido);

module.exports = router;
