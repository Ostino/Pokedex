const Entrenador = require('../models/Entrenador.model')
const bcrypt = require('bcryptjs');

exports.obtenerEntrenadores = async (req, res) => {
  try {
    const entrenadores = await Entrenador.findAll();
    res.json(entrenadores);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.obtenerEntrenador = async (req, res) => {
  try {
    const entrenador = await Entrenador.findByPk(req.params.id);
    if (!entrenador) return res.status(404).json({ error: 'Entrenador no encontrado' });
    res.json(entrenador);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.obtenerPerfil = async (req, res) => {
  try {
    res.json({
      id: req.user.id,
      username: req.user.username,
      rol: req.user.rol
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener perfil', details: error.message });
  }
};

exports.actualizarEntrenador = async (req, res) => {
  try {
    const entrenador = await Entrenador.findByPk(req.params.id);
    if (!entrenador) return res.status(404).json({ error: 'Entrenador no encontrado' });

    const { username, password } = req.body;
    if (username) entrenador.username = username;
    if (password) entrenador.password = password;

    await entrenador.save();
    res.json(entrenador);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.eliminarEntrenador = async (req, res) => {
  try {
    const entrenador = await Entrenador.findByPk(req.params.id);
    if (!entrenador) return res.status(404).json({ error: 'Entrenador no encontrado' });

    await entrenador.destroy();
    res.json({ mensaje: 'Entrenador eliminado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.hacerAdmin = async (req, res) => {
  try {
    const entrenador = await Entrenador.findByPk(req.params.id);
    if (!entrenador) return res.status(404).json({ error: 'Entrenador no encontrado' });

    entrenador.rol = 2;
    await entrenador.save();
    res.json({ mensaje: 'Entrenador ahora es admin', entrenador });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.quitarAdmin = async (req, res) => {
  try {
    const entrenador = await Entrenador.findByPk(req.params.id);
    if (!entrenador) return res.status(404).json({ error: 'Entrenador no encontrado' });

    entrenador.rol = 1;
    await entrenador.save();
    res.json({ mensaje: 'Rol de admin removido', entrenador });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.cambiarPassword = async (req, res) => {
  const { id } = req.params;
  const { nuevaPassword } = req.body;

  if (!nuevaPassword ) {
    return res.status(400).json({ error: 'La contraseña debe tener un valor' });
  }

  try {
    const entrenador = await Entrenador.findByPk(id);
    if (!entrenador) {
      return res.status(404).json({ error: 'Entrenador no encontrado' });
    }

    const hash = await bcrypt.hash(nuevaPassword, 10);
    entrenador.password = hash;
    await entrenador.save();

    res.json({ mensaje: 'Contraseña actualizada correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar contraseña', detalles: error.message });
  }
};