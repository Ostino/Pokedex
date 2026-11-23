const ROL_USUARIO = 1;
const ROL_ADMIN = 2;

const esAdmin = (user) => !!user && user.rol === ROL_ADMIN;

// El usuario puede acceder a un recurso si es suyo o si es administrador.
const puedeAcceder = (user, entrenadorId) =>
  esAdmin(user) || (!!user && Number(user.id) === Number(entrenadorId));

module.exports = { ROL_USUARIO, ROL_ADMIN, esAdmin, puedeAcceder };
