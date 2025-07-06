const express = require('express');
const router = express.Router();
const StatsController = require('../controllers/Stats.controller');
const requireUser = require('../middlewares/requiredUser');

router.post('/', requireUser, StatsController.crearStats);
router.get('/', requireUser, StatsController.obtenerTodos);
router.get('/:id', requireUser, StatsController.obtenerPorId);
router.put('/:id', requireUser, StatsController.actualizar);
router.delete('/:id', requireUser, StatsController.eliminar);

module.exports = router;
