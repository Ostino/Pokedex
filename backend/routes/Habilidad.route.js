const express = require('express');
const router = express.Router();
const HabilidadController = require('../controllers/Habilidad.controller');
const requireUser = require('../middlewares/requiredUser');
const requireAdmin = require('../middlewares/requiredAdmin');

router.post('/', requireUser, requireAdmin, HabilidadController.crearHabilidad);
router.get('/:id', requireUser, HabilidadController.obtenerHabilidad);
router.get('/', requireUser, HabilidadController.obtenerHabilidades);

module.exports = router;
