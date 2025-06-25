const { Ivs } = require('../models');

// Crear nuevo registro IVs
exports.crearIvs = async (req, res) => {
  try {
    const nuevo = await Ivs.create(req.body);
    res.status(201).json({ id: nuevo.id });
  } catch (error) {
    res.status(400).json({ error: 'Error al crear IVs', detalles: error.message });
  }
};

// Obtener todos los IVs
exports.obtenerTodos = async (req, res) => {
  try {
    const ivs = await Ivs.findAll();
    res.json(ivs);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener IVs', detalles: error.message });
  }
};

// Obtener un IV por id
exports.obtenerPorId = async (req, res) => {
  try {
    const iv = await Ivs.findByPk(req.params.id);
    if (!iv) {
      return res.status(404).json({ error: 'IVs no encontrado' });
    }
    res.json(iv);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener IVs', detalles: error.message });
  }
};

// Actualizar IVs por id
exports.actualizar = async (req, res) => {
  try {
    const iv = await Ivs.findByPk(req.params.id);
    if (!iv) {
      return res.status(404).json({ error: 'IVs no encontrado para actualizar' });
    }
    await iv.update(req.body);
    res.json({ id: iv.id });
  } catch (error) {
    res.status(400).json({ error: 'Error al actualizar IVs', detalles: error.message });
  }
};

//
