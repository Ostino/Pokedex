const multer = require('multer');

const LIMITE_IMAGEN_MB = 2;
const LIMITE_IMAGEN = LIMITE_IMAGEN_MB * 1024 * 1024;

// Manejador de errores de Express para las subidas con multer.
// Se registra al final de app.js; los demás errores siguen su curso normal.
const manejarErrorSubida = (err, req, res, next) => {
  if (!(err instanceof multer.MulterError)) return next(err);

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: `La imagen supera el tamaño máximo de ${LIMITE_IMAGEN_MB} MB` });
  }
  return res.status(400).json({ error: 'Error al subir la imagen', detalles: err.message });
};

module.exports = { LIMITE_IMAGEN, manejarErrorSubida };
