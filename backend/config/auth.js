// Único punto de configuración del secreto JWT (lo usan el login y el middleware).
const SECRETO_DESARROLLO = 'secreto-solo-para-desarrollo';

const esProduccion = process.env.NODE_ENV === 'production';

function cargarSecreto() {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;

  if (esProduccion) {
    // index.js ya lo comprueba antes de arrancar; esto evita usar la app sin secreto por otra vía.
    throw new Error('JWT_SECRET es obligatorio en producción');
  }

  console.warn('⚠️  JWT_SECRET no está definido: se usa un secreto de desarrollo. No lo uses en producción.');
  return SECRETO_DESARROLLO;
}

module.exports = {
  JWT_SECRET: cargarSecreto(),
  JWT_EXPIRES_IN: '1d',
};
