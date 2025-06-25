const { Evs } = require('../models');

// Crear nuevo registro IVs
exports.crearEvs = async (req, res) => {
  try {
    const nuevo = await Evs.create(req.body);
    res.status(201).json({ id: nuevo.id });
  } catch (error) {
    res.status(400).json({ error: 'Error al crear Evs', detalles: error.message });
  }
};

// Obtener todos los Evs
exports.obtenerTodos = async (req, res) => {
  try {
    const evs = await Evs.findAll();
    res.json(evs);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener Evs', detalles: error.message });
  }
};

// Obtener un Evs por id
exports.obtenerPorId = async (req, res) => {
  try {
    const ev = await Evs.findByPk(req.params.id);
    if (!ev) {
      return res.status(404).json({ error: 'Evs no encontrado' });
    }
    res.json(ev);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener Evs', detalles: error.message });
  }
};

// Actualizar Evs por id
exports.actualizar = async (req, res) => {
  try {
    const ev = await Evs.findByPk(req.params.id);
    if (!ev) {
      return res.status(404).json({ error: 'Evs no encontrado para actualizar' });
    }
    await ev.update(req.body);
    res.json({ id: ev.id });
  } catch (error) {
    res.status(400).json({ error: 'Error al actualizar Evs', detalles: error.message });
  }
};

