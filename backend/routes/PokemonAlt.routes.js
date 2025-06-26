const express = require('express');
const router = express.Router();
const controller = require('../controllers/PokemonAlt.controller');
const requireUser = require('../middlewares/requiredUser');

router.get('/por-entrenador/:entrenadorId', requireUser, controller.obtenerPorEntrenadorId);
router.get('/por-equipo/:equipoId', requireUser, controller.obtenerPorEquipoId);
router.get('/', requireUser, controller.obtenerTodos);
router.get('/:id', requireUser, controller.obtenerPorId);
router.post('/', requireUser, controller.crear);
router.put('/:id', requireUser, controller.actualizar);
router.delete('/:id', requireUser, controller.eliminarPokemonAlt);

module.exports = router;
