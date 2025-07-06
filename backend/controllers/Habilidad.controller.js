const { Habilidades } = require('../models');

exports.crearHabilidad = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    const habilidad = await Habilidades.create({ nombre, descripcion });
    res.status(201).json(habilidad);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear habilidad', detalles: error.message });
  }
};

exports.obtenerHabilidad = async (req, res) => {
  try {
    const habilidad = await Habilidades.findByPk(req.params.id);
    if (!habilidad) {
      return res.status(404).json({ error: 'Habilidad no encontrada' });
    }
    res.json(habilidad);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener habilidad', detalles: error.message });
  }
};

exports.obtenerHabilidades = async (req, res) => {
  try {
    const habilidades = await Habilidades.findAll();
    res.json(habilidades);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener habilidades', detalles: error.message });
  }
};
