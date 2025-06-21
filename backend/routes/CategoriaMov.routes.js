const express = require('express');
const router = express.Router();
const CategoriaMovController = require('../controllers/CategoriaMov.controller');

router.get('/:id',CategoriaMovController.obtenerCategoria);
router.get('/', CategoriaMovController.obtenerCategorias);

module.exports = router;
