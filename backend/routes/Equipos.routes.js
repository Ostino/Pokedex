const express = require('express');
const router = express.Router();
const equipoController = require('../controllers/Equipo.controller');
const requiredUser = require('../middlewares/requiredUser')
// Ruta para obtener todos los equipos
router.get('/',requiredUser ,equipoController.obtenerTodos);

// Ruta para obtener un equipo en particular por ID
router.get('/:id',requiredUser, equipoController.obtenerPorId);

// Ruta para crear un nuevo equipo
router.post('/', requiredUser,equipoController.createEquipo);

// Ruta para actualizar un equipo existente
router.put('/:id',requiredUser, equipoController.updateEquipo);

// Ruta para eliminar un equipo
router.delete('/:id',requiredUser, equipoController.deleteEquipo);

module.exports = router;