const Entrenador = require('../models/Entrenador.model')
const Token = require('../models/Token.model')

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/auth');

exports.register = async (req, res) => {
  try {
    const { username, password,email } = req.body;
    
    const existe = await Entrenador.findOne({ where: { username } });
    if (existe) return res.status(400).json({ error: 'Username ya registrado' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const entrenador = await Entrenador.create({ username, password: hashedPassword ,email});

    const { id, rol } = entrenador;
    res.status(201).json({ mensaje: 'Entrenador registrado', entrenador: { id, username: entrenador.username, email: entrenador.email, rol } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const entrenador = await Entrenador.scope('conPassword').findOne({ where: { username } });
    if (!entrenador) return res.status(404).json({ error: 'Usuario no encontrado' });

    const valido = await bcrypt.compare(password, entrenador.password);
    if (!valido) return res.status(401).json({ error: 'Contraseña incorrecta' });

    const token = jwt.sign({ id: entrenador.id, rol: entrenador.rol, username: entrenador.username }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    await Token.create({ token, entrenadorId: entrenador.id });

    res.json({ mensaje: 'Login exitoso', token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.logout = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token requerido' });

    const eliminado = await Token.destroy({ where: { token } });
    res.json({ mensaje: eliminado ? 'Logout exitoso' : 'Token no encontrado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.logoutAll = async (req, res) => {
  try {
    const entrenadorId = req.user.id;
    const cantidadEliminada = await Token.destroy({
      where: { entrenadorId }
    });

    res.json({ mensaje: `Se cerraron ${cantidadEliminada} sesión(es).` });
  } catch (error) {
    res.status(500).json({ error: 'Error al cerrar todas las sesiones', detalles: error.message });
  }
};
