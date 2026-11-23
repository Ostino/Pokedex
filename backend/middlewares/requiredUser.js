const jwt = require('jsonwebtoken');
const { Token, Entrenador } = require('../models');
const { JWT_SECRET } = require('../config/auth');

const requireUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }

    const tokenStr = authHeader.split(' ')[1];

    // Firma y caducidad: un token caducado o manipulado se rechaza y se borra.
    let payload;
    try {
      payload = jwt.verify(tokenStr, JWT_SECRET);
    } catch {
      await Token.destroy({ where: { token: tokenStr } });
      return res.status(401).json({ error: 'Token inválido o expirado' });
    }

    // Revocación: el token tiene que seguir existiendo (logout lo elimina).
    const token = await Token.findOne({
      where: { token: tokenStr },
      include: {
        model: Entrenador,
        as: 'entrenador',
        attributes: ['id', 'rol', 'username', 'createdAt']
      }
    });

    if (!token || !token.entrenador) {
      // Token auténtico cuya cuenta ya no existe: la borró la limpieza de la demo (o un admin).
      // Se indica con un código para que el frontend pueda explicarlo.
      if (payload?.id && (await Entrenador.count({ where: { id: payload.id } })) === 0) {
        return res.status(401).json({ error: 'Tu cuenta ya no existe', codigo: 'CUENTA_ELIMINADA' });
      }
      return res.status(401).json({ error: 'Token inválido o expirado' });
    }

    req.user = token.entrenador;
    next();
  } catch (err) {
    res.status(500).json({ error: 'Error al verificar token', details: err.message });
  }
};

module.exports = requireUser;
