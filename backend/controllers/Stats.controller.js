const { Stats } = require('../models');

// Crear Stats
exports.crearStats = async (req, res) => {
  try {
    const nuevo = await Stats.create(req.body);
    res.status(201).json({ id: nuevo.id });
  } catch (error) {
    res.status(400).json({ error: 'Error al crear stats', detalles: error.message });
  }
};

// Obtener todos los Stats
exports.obtenerTodos = async (req, res) => {
  try {
    const todos = await Stats.findAll();
    res.json(todos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener stats', detalles: error.message });
  }
};

// Obtener Stats por id
exports.obtenerPorId = async (req, res) => {
  try {
    const stats = await Stats.findByPk(req.params.id);
    if (!stats) {
      return res.status(404).json({ error: 'Stats no encontrado' });
    }
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener stats', detalles: error.message });
  }
};

// Actualizar Stats por id
exports.actualizar = async (req, res) => {
  try {
    const stats = await Stats.findByPk(req.params.id);
    if (!stats) {
      return res.status(404).json({ error: 'Stats no encontrado' });
    }
    await stats.update(req.body);
    res.json({ id: stats.id });
  } catch (error) {
    res.status(400).json({ error: 'Error al actualizar stats', detalles: error.message });
  }
};

// Eliminar Stats por id
exports.eliminar = async (req, res) => {
  try {
    const eliminado = await Stats.destroy({
      where: { id: req.params.id }
    });
    if (!eliminado) {
      return res.status(404).json({ error: 'Stats no encontrado para eliminar' });
    }
    res.json({ mensaje: 'Stats eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar stats', detalles: error.message });
  }
};
