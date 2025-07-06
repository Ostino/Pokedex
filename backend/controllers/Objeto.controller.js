const { Objeto } = require('../models');
const path = require('path');
const fs = require('fs');

exports.crearObjeto = async (req, res) => {
  try {
    const data = req.body;

    if (req.file) {
      data.imagen = req.file.filename;
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
    const objeto = await Objeto.findByPk(req.params.id);

    if (!objeto) {
      return res.status(404).json({ error: 'Objeto no encontrado para actualizar' });
    }

    if (req.file) {
      const rutaAnterior = path.join(__dirname, '..', 'Imagenes', 'Objetos', objeto.imagen);
      if (fs.existsSync(rutaAnterior)) {
        fs.unlinkSync(rutaAnterior);
      }
      objeto.imagen = req.file.filename;
    }

    if (req.body.nombre && !req.file) {
      const nombreAntiguo = objeto.nombre;
      const nombreNuevo = req.body.nombre;
      const extension = path.extname(objeto.imagen);

      const rutaAnterior = path.join(__dirname, '..', 'Imagenes', 'Objetos', objeto.imagen);
      const nuevoNombreImagen = nombreNuevo.toLowerCase().replace(/\s+/g, '_').replace(/[^\w\-]/g, '') + extension;
      const nuevaRuta = path.join(__dirname, '..', 'Imagenes', 'Objetos', nuevoNombreImagen);

      if (fs.existsSync(rutaAnterior)) {
        fs.renameSync(rutaAnterior, nuevaRuta);
        objeto.imagen = nuevoNombreImagen;
      }
    }

    if (req.body.nombre !== undefined) objeto.nombre = req.body.nombre;
    if (req.body.descripcion !== undefined) objeto.descripcion = req.body.descripcion;

    await objeto.save();
    res.json({ mensaje: 'Objeto actualizado correctamente', objeto });

  } catch (error) {
    res.status(400).json({ error: 'Error al actualizar objeto', detalles: error.message });
  }
};

exports.eliminar = async (req, res) => {
  try {
    const objeto = await Objeto.findByPk(req.params.id);

    if (!objeto) {
      return res.status(404).json({ error: 'Objeto no encontrado para eliminar' });
    }

    const rutaImagen = path.join(__dirname, '..', 'Imagenes', 'Objetos', objeto.imagen);

    if (fs.existsSync(rutaImagen)) {
      fs.unlinkSync(rutaImagen);
    }

    await objeto.destroy();

    res.json({ mensaje: 'objeto eliminado correctamente, incluyendo su imagen.' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el objeto', detalles: error.message });
  }
};
