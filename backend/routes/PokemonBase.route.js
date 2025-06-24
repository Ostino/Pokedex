const express = require('express');
const router = express.Router();
const upload = require('../middlewares/uploadPokemonBase');
const PokemonBaseController = require('../controllers/PokemonBase.controller');
const requireUser = require('../middlewares/requiredUser');
const requireAdmin = require('../middlewares/requiredAdmin');

// CRUD protegido solo para usuarios autenticados
router.post('/',requireUser,requireAdmin,upload.single('imagen'),PokemonBaseController.crearPokemonBase);
router.get('/', requireUser, PokemonBaseController.obtenerTodos);
router.get('/verificar-numero/:numeroPokedex', requireUser,PokemonBaseController.verificarNumeroPokedex);
router.post('/:id/asignar-stats', requireUser, requireAdmin, PokemonBaseController.asignarStatsBase);
router.get('/:id', requireUser, PokemonBaseController.obtenerPorId);
router.put('/:id', requireUser, requireAdmin,upload.single('imagen'), PokemonBaseController.actualizar);
router.delete('/:id', requireUser, requireAdmin, PokemonBaseController.eliminar);

module.exports = router;
