const { Naturaleza } = require('../models');

exports.obtenerTodas = async (req, res) => {
  try {
    const naturalezas = await Naturaleza.findAll();
    res.json(naturalezas);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener naturalezas', detalles: error.message });
  }
};

exports.obtenerUna = async (req, res) => {
  try {
    const { id } = req.params;
    const naturaleza = await Naturaleza.findByPk(id);

    if (!naturaleza) {
      return res.status(404).json({ error: 'Naturaleza no encontrada' });
    }

    res.json(naturaleza);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener naturaleza', detalles: error.message });
  }
};
