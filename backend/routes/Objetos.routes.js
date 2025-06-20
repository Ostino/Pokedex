const express = require('express');
const router = express.Router();
const ObjetoController = require('../controllers/Objeto.controller');
const upload = require('../middlewares/uploadObjeto');
const requireUser = require('../middlewares/requiredUser');
const requireAdmin = require('../middlewares/requiredAdmin');

router.post('/', requireUser, requireAdmin, upload.single('imagen'), ObjetoController.crearObjeto);
router.get('/', ObjetoController.obtenerTodos);
router.get('/:id', ObjetoController.obtenerPorId);
router.put('/:id', requireUser, requireAdmin, upload.single('imagen'), ObjetoController.actualizar);
router.delete('/:id', requireUser, requireAdmin, ObjetoController.eliminar);

module.exports = router;
