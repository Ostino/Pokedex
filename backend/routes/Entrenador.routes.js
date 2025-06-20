const express = require('express');
const router = express.Router();
const EntrenadorController = require('../controllers/Entrenador.controller');
const requireUser = require('../middlewares/requiredUser');
const requireAdmin = require('../middlewares/requiredAdmin');

// Perfil actual
router.get('/me', requireUser, EntrenadorController.obtenerPerfil);
router.get('/admin', requireUser,requireAdmin, EntrenadorController.obtenerPerfil);

// Obtener entrenadores
router.get('/obtener/:id', requireUser, EntrenadorController.obtenerEntrenador);
router.get('/allEntrenadores', requireUser, EntrenadorController.obtenerEntrenadores);

// Actualizar y eliminar
router.put('/actualizar/:id', requireUser, EntrenadorController.actualizarEntrenador);
router.delete('/eliminar/:id', requireUser, requireAdmin, EntrenadorController.eliminarEntrenador);
router.patch('/:id/cambiar-password', requireUser, requireAdmin, EntrenadorController.cambiarPassword);

// Cambiar roles
router.patch('/:id/hacer-admin', requireUser, requireAdmin, EntrenadorController.hacerAdmin);
router.patch('/:id/quitar-admin', requireUser, requireAdmin, EntrenadorController.quitarAdmin);

module.exports = router;
