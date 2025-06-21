const CategoriaMov = require('../models/CategoriaMov.model');

// Obtener una categoría por ID
exports.obtenerCategoria = async (req, res) => {
  try {
    const categoria = await CategoriaMov.findByPk(req.params.id);
    if (!categoria) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }
    res.json(categoria);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la categoría', detalles: error.message });
  }
};

// Obtener todas las categorías
exports.obtenerCategorias = async (req, res) => {
  try {
    const categorias = await CategoriaMov.findAll();
    res.json(categorias);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las categorías', detalles: error.message });
  }
};
