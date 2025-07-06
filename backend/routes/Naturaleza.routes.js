const express = require('express');
const router = express.Router();
const NaturalezaController = require('../controllers/Naturaleza.controller');

router.get('/', NaturalezaController.obtenerTodas);
router.get('/:id', NaturalezaController.obtenerUna);

module.exports = router;
