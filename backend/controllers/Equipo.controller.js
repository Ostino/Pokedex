const { Entrenador, Equipo } = require('../models');

exports.obtenerTodos = async (req, res) => {
  try {
    const entrenadores = await Entrenador.findAll({
      include: [
        { model: Equipo, as: 'equipos' }
      ]
    });
    res.json(entrenadores);
  } catch (error) {
    res.status(500).json({
      error: 'Error al obtener entrenadores',
      detalles: error.message
    });
  }
};

exports.obtenerPorId = async (req, res) => {
  try {
    const usuarioId = req.user.id;
    const entrenador = await Entrenador.findByPk(usuarioId, {
      include: [
        { model: Equipo, as: 'equipos' }
      ]
    });
    if (!entrenador) {
      return res.status(404).json({ error: 'Entrenador no encontrado' });
    }
    res.json(entrenador);
  } catch (error) {
    res.status(500).json({
      error: 'Error al obtener el entrenador',
      detalles: error.message
    });
  }
};

exports.createEquipo = async (req, res) => {
  try {
    const entrenadorId = req.user.id;
    const { nombre  } = req.body;
    if (!nombre || !entrenadorId) {
      return res.status(400).json({ message: 'Es necesario proporcionar nombre y entrenadorId' });
    }
    const nuevoEquipo = await Equipo.create({ nombre, entrenadorId });
    res.status(201).json(nuevoEquipo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateEquipo = async (req, res) => {
  try {
        const entrenadorId = req.user.id;
    const { id } = req.params;
    const { nombre } = req.body;
    const equipo = await Equipo.findByPk(id);
    if (!equipo) {
      return res.status(404).json({ message: 'Equipo no encontrado' });
    }
    equipo.nombre = nombre || equipo.nombre;
    equipo.entrenadorId = entrenadorId || equipo.entrenadorId;
    await equipo.save();
    res.json(equipo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteEquipo = async (req, res) => {
  try {
    const { id } = req.params;
    const equipo = await Equipo.findByPk(id);
    if (!equipo) {
      return res.status(404).json({ message: 'Equipo no encontrado' });
    }
    await equipo.destroy();
    res.json({ message: 'Equipo eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};