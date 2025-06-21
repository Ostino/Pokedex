const express = require('express');
const router = express.Router();
const HabilidadController = require('../controllers/Habilidad.controller');
const requireUser = require('../middlewares/requiredUser');
const requireAdmin = require('../middlewares/requiredAdmin');

// Crear una habilidad
router.post('/', requireUser, requireAdmin, HabilidadController.crearHabilidad);

// Obtener una habilidad por ID
router.get('/:id', requireUser, HabilidadController.obtenerHabilidad);

// Obtener todas las habilidades
router.get('/', requireUser, HabilidadController.obtenerHabilidades);

module.exports = router;
