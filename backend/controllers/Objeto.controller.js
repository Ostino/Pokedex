const { Objeto } = require('../models');

exports.crearObjeto = async (req, res) => {
  try {
    const data = req.body;

    if (req.file) {
      data.imagen = `/Imagenes/Objetos/${req.file.filename}`;
    }

    const nuevo = await Objeto.create(data);
    res.status(201).json(nuevo);
  } catch (error) {
    res.status(400).json({ error: 'Error al crear objeto', detalles: error.message });
  }
};

exports.obtenerTodos = async (req, res) => {
  try {
    const objetos = await Objeto.findAll();
    res.json(objetos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener objetos', detalles: error.message });
  }
};

exports.obtenerPorId = async (req, res) => {
  try {
    const obj = await Objeto.findByPk(req.params.id);

    if (!obj) return res.status(404).json({ error: 'Objeto no encontrado' });

    res.json(obj);
  } catch (error) {
    res.status(500).json({ error: 'Error al buscar objeto', detalles: error.message });
  }
};

exports.actualizar = async (req, res) => {
  try {
    const data = req.body;

    if (req.file) {
      data.imagen = `/Imagenes/Objetos/${req.file.filename}`;
    }

    const actualizado = await Objeto.update(data, {
      where: { id: req.params.id }
    });

    if (actualizado[0] === 0) {
      return res.status(404).json({ error: 'Objeto no encontrado para actualizar' });
    }

    res.json({ mensaje: 'Objeto actualizado correctamente' });
  } catch (error) {
    res.status(400).json({ error: 'Error al actualizar objeto', detalles: error.message });
  }
};

exports.eliminar = async (req, res) => {
  try {
    const eliminado = await Objeto.destroy({ where: { id: req.params.id } });

    if (!eliminado) {
      return res.status(404).json({ error: 'Objeto no encontrado para eliminar' });
    }

    res.json({ mensaje: 'Objeto eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar objeto', detalles: error.message });
  }
};
