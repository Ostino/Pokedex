const Tipo = require('../models/Tipo.model');

// Obtener todos los tipos
exports.obtenerTipos = async (req, res) => {
  try {
    const tipos = await Tipo.findAll();
    res.json(tipos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los tipos', detalles: error.message });
  }
};

// Obtener un tipo por ID
exports.obtenerTipo = async (req, res) => {
  try {
    const tipo = await Tipo.findByPk(req.params.id);
    if (!tipo) {
      return res.status(404).json({ error: 'Tipo no encontrado' });
    }
    res.json(tipo);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el tipo', detalles: error.message });
  }
};
