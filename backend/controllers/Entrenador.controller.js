const Entrenador = require('../models/Entrenador.model')
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const { puedeAcceder } = require('../utils/permisos');
const {
  validarUsername, validarPassword, igualSinMayusculas, mensajeDuplicado,
} = require('../utils/validacionEntrenador');
const { infoLimpiezaParaCuenta } = require('../limpiezaDemo');

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
    if (!puedeAcceder(req.user, req.params.id)) {
      return res.status(403).json({ error: 'No tienes permiso para ver este entrenador' });
    }
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
      rol: req.user.rol,
      // Si la limpieza de la demo está activa: cuándo se borrará esta cuenta y si sus equipos son temporales.
      // Si algo fallara al calcularlo, el perfil se sirve igual (sin aviso) en vez de dar error.
      limpiezaDemo: await infoLimpiezaParaCuenta(req.user).catch(() => null),
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener perfil', details: error.message });
  }
};

exports.actualizarEntrenador = async (req, res) => {
  try {
    if (!puedeAcceder(req.user, req.params.id)) {
      return res.status(403).json({ error: 'No tienes permiso para modificar este entrenador' });
    }
    const entrenador = await Entrenador.findByPk(req.params.id);
    if (!entrenador) return res.status(404).json({ error: 'Entrenador no encontrado' });

    const { username, password } = req.body || {};

    if (username !== undefined) {
      const nuevo = validarUsername(username);
      if (nuevo.error) return res.status(400).json({ error: nuevo.error });
      const ocupado = await Entrenador.findOne({
        where: { [Op.and]: [igualSinMayusculas('username', nuevo.valor), { id: { [Op.ne]: entrenador.id } }] },
      });
      if (ocupado) return res.status(400).json({ error: 'Ese nombre de usuario ya está en uso' });
      entrenador.username = nuevo.valor;
    }

    if (password !== undefined) {
      const nueva = validarPassword(password);
      if (nueva.error) return res.status(400).json({ error: nueva.error });
      entrenador.password = await bcrypt.hash(nueva.valor, 10);
    }

    await entrenador.save();
    res.json(entrenador);
  } catch (error) {
    const duplicado = mensajeDuplicado(error);
    if (duplicado) return res.status(400).json({ error: duplicado });
    res.status(500).json({ error: 'Error al actualizar el entrenador' });
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
  const { nuevaPassword } = req.body || {};

  const nueva = validarPassword(nuevaPassword);
  if (nueva.error) {
    return res.status(400).json({ error: nueva.error });
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