const express = require('express');
const router = express.Router();
const IvsController = require('../controllers/IVs.controller');
const requireUser = require('../middlewares/requiredUser');

router.post('/', requireUser, IvsController.crearIvs);
router.get('/', requireUser, IvsController.obtenerTodos);
router.get('/:id', requireUser, IvsController.obtenerPorId);
router.put('/:id', requireUser, IvsController.actualizar);

module.exports = router;
