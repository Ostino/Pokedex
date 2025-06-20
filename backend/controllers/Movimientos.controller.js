const { Movimiento, Tipo, Categoria } = require('../models');

exports.crearMovimiento = async (req, res) => {
  try {
    const nuevo = await Movimiento.create(req.body);
    res.status(201).json(nuevo);
  } catch (error) {
    res.status(400).json({ error: 'Error al crear el movimiento', detalles: error.message });
  }
};

exports.obtenerTodos = async (req, res) => {
  try {
    const movimientos = await Movimiento.findAll({
      include: [
        { model: Tipo, as: 'tipo' },
        { model: Categoria, as: 'categoriamovimiento' }
      ]
    });
    res.json(movimientos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener movimientos', detalles: error.message });
  }
};

exports.obtenerPorId = async (req, res) => {
  try {
    const mov = await Movimiento.findByPk(req.params.id, {
      include: [
        { model: Tipo, as: 'tipo' },
        { model: Categoria, as: 'categoriamovimiento' }
      ]
    });

    if (!mov) {
      return res.status(404).json({ error: 'Movimiento no encontrado' });
    }

    res.json(mov);
  } catch (error) {
    res.status(500).json({ error: 'Error al buscar movimiento', detalles: error.message });
  }
};

exports.actualizar = async (req, res) => {
  try {
    const actualizado = await Movimiento.update(req.body, {
      where: { id: req.params.id }
    });

    if (actualizado[0] === 0) {
      return res.status(404).json({ error: 'Movimiento no encontrado para actualizar' });
    }

    res.json({ mensaje: 'Movimiento actualizado correctamente' });
  } catch (error) {
    res.status(400).json({ error: 'Error al actualizar movimiento', detalles: error.message });
  }
};

exports.eliminar = async (req, res) => {
  try {
    const eliminado = await Movimiento.destroy({
      where: { id: req.params.id }
    });

    if (!eliminado) {
      return res.status(404).json({ error: 'Movimiento no encontrado para eliminar' });
    }

    res.json({ mensaje: 'Movimiento eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar movimiento', detalles: error.message });
  }
};
