const express = require('express');
const router = express.Router();
const equipoController = require('../controllers/Equipo.controller');
const requiredUser = require('../middlewares/requiredUser')

router.get('/',requiredUser ,equipoController.obtenerTodos);
router.get('/:id',requiredUser, equipoController.obtenerPorId);
router.post('/', requiredUser,equipoController.createEquipo);
router.put('/:id',requiredUser, equipoController.updateEquipo);
router.delete('/:id',requiredUser, equipoController.deleteEquipo);

module.exports = router;