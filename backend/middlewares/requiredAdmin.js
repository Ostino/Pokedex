const { esAdmin } = require('../utils/permisos');

const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'No autenticado' });
  }

  if (!esAdmin(req.user)) {
    return res.status(403).json({ error: 'Acceso denegado: se requiere rol de administrador' });
  }

  next();
};
module.exports = requireAdmin;
