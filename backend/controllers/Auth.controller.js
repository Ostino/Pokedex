const Entrenador = require('../models/Entrenador.model')
const Token = require('../models/Token.model')

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/auth');
const {
  validarUsername, validarPassword, validarEmail, igualSinMayusculas, mensajeDuplicado,
} = require('../utils/validacionEntrenador');

exports.register = async (req, res) => {
  try {
    const body = req.body || {};
    const username = validarUsername(body.username);
    const password = validarPassword(body.password);
    const email = validarEmail(body.email);
    const errorValidacion = username.error || email.error || password.error;
    if (errorValidacion) return res.status(400).json({ error: errorValidacion });

    if (await Entrenador.findOne({ where: igualSinMayusculas('username', username.valor) })) {
      return res.status(400).json({ error: 'Ese nombre de usuario ya está en uso' });
    }
    if (await Entrenador.findOne({ where: igualSinMayusculas('email', email.valor) })) {
      return res.status(400).json({ error: 'Ese email ya está registrado' });
    }

    const hashedPassword = await bcrypt.hash(password.valor, 10);
    // Solo se guardan estos campos: el rol siempre es el de entrenador por defecto.
    const entrenador = await Entrenador.create({ username: username.valor, password: hashedPassword, email: email.valor });

    const { id, rol } = entrenador;
    res.status(201).json({ mensaje: 'Entrenador registrado', entrenador: { id, username: entrenador.username, email: entrenador.email, rol } });
  } catch (error) {
    const duplicado = mensajeDuplicado(error);
    if (duplicado) return res.status(400).json({ error: duplicado });
    res.status(500).json({ error: 'Error al registrar el entrenador' });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const entrenador = await Entrenador.scope('conPassword').findOne({ where: { username } });
    if (!entrenador) return res.status(404).json({ error: 'Usuario no encontrado' });

    const valido = await bcrypt.compare(password, entrenador.password);
    if (!valido) return res.status(401).json({ error: 'Contraseña incorrecta' });

    res.json({ mensaje: 'Login exitoso', token: await emitirToken(entrenador) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Entrar con la cuenta demo sin escribir la contraseña (botón del login). Solo funciona si la cuenta
// demo está habilitada con DEMO_PASSWORD; esa contraseña ya es pública, así que no se expone nada nuevo.
exports.loginDemo = async (req, res) => {
  try {
    const demo = process.env.DEMO_PASSWORD && await Entrenador.findOne({ where: { username: 'demo' } });
    if (!demo) return res.status(404).json({ error: 'La cuenta demo no está disponible' });

    res.json({ mensaje: 'Login exitoso', token: await emitirToken(demo) });
  } catch (error) {
    res.status(500).json({ error: 'Error al entrar con la cuenta demo' });
  }
};

// Firma un JWT para la cuenta y lo registra en la tabla de sesiones.
async function emitirToken(entrenador) {
  const token = jwt.sign({ id: entrenador.id, rol: entrenador.rol, username: entrenador.username }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  await Token.create({ token, entrenadorId: entrenador.id });
  return token;
}

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
