const express = require('express');
const router = express.Router();
const TipoController = require('../controllers/Tipo.controller');

router.get('/',TipoController.obtenerTipos);
router.get('/:id',TipoController.obtenerTipo);

module.exports = router;
