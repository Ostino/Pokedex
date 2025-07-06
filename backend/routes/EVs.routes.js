const express = require('express');
const router = express.Router();
const EvsController = require('../controllers/EVs.controller');
const requireUser = require('../middlewares/requiredUser');

router.post('/', requireUser, EvsController.crearEvs);
router.get('/', requireUser, EvsController.obtenerTodos);
router.get('/:id', requireUser, EvsController.obtenerPorId);
router.put('/:id', requireUser, EvsController.actualizar);

module.exports = router;
