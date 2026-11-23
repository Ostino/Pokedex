// Reglas de los datos de una cuenta. Se usan al registrarse, al editar la cuenta
// y cuando un admin cambia una contraseña.
const { fn, col, where } = require('sequelize');

const USERNAME_MIN = 3;
const USERNAME_MAX = 30;
// Solo letras sin acentos, números, punto, guion y guion bajo: evita nombres que
// imiten a otros con espacios o con letras de otros alfabetos que se ven iguales.
const USERNAME_FORMATO = /^[A-Za-z0-9._-]+$/;

const PASSWORD_MIN = 6;
const PASSWORD_MAX_BYTES = 72; // bcrypt ignora lo que pase de 72 bytes

const EMAIL_MAX = 254;
const EMAIL_FORMATO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const esTexto = (valor) => typeof valor === 'string';

function validarUsername(valor) {
  if (!esTexto(valor) || !valor.trim()) return { error: 'El nombre de usuario es obligatorio' };
  const username = valor.trim();
  if (username.length < USERNAME_MIN || username.length > USERNAME_MAX) {
    return { error: `El nombre de usuario debe tener entre ${USERNAME_MIN} y ${USERNAME_MAX} caracteres` };
  }
  if (!USERNAME_FORMATO.test(username)) {
    return { error: 'El nombre de usuario solo puede tener letras sin acentos, números, punto, guion y guion bajo' };
  }
  return { valor: username };
}

function validarPassword(valor) {
  if (!esTexto(valor) || valor.length === 0) return { error: 'La contraseña es obligatoria' };
  if (valor.length < PASSWORD_MIN) return { error: `La contraseña debe tener al menos ${PASSWORD_MIN} caracteres` };
  if (Buffer.byteLength(valor, 'utf8') > PASSWORD_MAX_BYTES) {
    return { error: `La contraseña es demasiado larga (máximo ${PASSWORD_MAX_BYTES} caracteres)` };
  }
  return { valor };
}

function validarEmail(valor) {
  if (!esTexto(valor) || !valor.trim()) return { error: 'El email es obligatorio' };
  const email = valor.trim().toLowerCase();
  if (email.length > EMAIL_MAX || !EMAIL_FORMATO.test(email)) return { error: 'El email no es válido' };
  return { valor: email };
}

// Condición "campo igual a valor sin distinguir mayúsculas" (lower() de SQLite cubre ASCII,
// que es lo único que admite el nombre de usuario).
const igualSinMayusculas = (campo, valor) => where(fn('lower', col(campo)), valor.toLowerCase());

// Traduce un choque con una restricción UNIQUE de la base (p. ej. dos registros simultáneos).
function mensajeDuplicado(error) {
  if (error?.name !== 'SequelizeUniqueConstraintError') return null;
  // Según el dialecto, `fields` es una lista (SQLite) o un objeto (otros); `errors` trae el campo en `path`.
  const campos = [
    ...(Array.isArray(error.fields) ? error.fields : Object.keys(error.fields || {})),
    ...(error.errors || []).map((e) => e.path),
  ].join(' ');
  if (campos.includes('email')) return 'Ese email ya está registrado';
  if (campos.includes('username')) return 'Ese nombre de usuario ya está en uso';
  return 'Ya existe una cuenta con esos datos';
}

module.exports = {
  USERNAME_MIN, USERNAME_MAX, PASSWORD_MIN,
  validarUsername, validarPassword, validarEmail, igualSinMayusculas, mensajeDuplicado,
};
