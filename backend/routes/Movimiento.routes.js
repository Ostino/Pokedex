const express = require('express');
const router = express.Router();
const MovimientoController = require('../controllers/Movimientos.controller');
const requireUser = require('../middlewares/requiredUser');
const requireAdmin = require('../middlewares/requiredAdmin');

router.post('/', requireUser, requireAdmin, MovimientoController.crearMovimiento);
router.get('/', MovimientoController.obtenerTodos);
router.get('/:id', MovimientoController.obtenerPorId);
router.put('/:id', requireUser, requireAdmin, MovimientoController.actualizar);
router.delete('/:id', requireUser, requireAdmin, MovimientoController.eliminar);

module.exports = router;
