const express = require('express');
const router = express.Router();
const NaturalezaController = require('../controllers/Naturaleza.controller');

// GET /api/naturalezas/
router.get('/', NaturalezaController.obtenerTodas);

// GET /api/naturalezas/:id
router.get('/:id', NaturalezaController.obtenerUna);

module.exports = router;
