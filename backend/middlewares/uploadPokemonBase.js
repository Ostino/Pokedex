const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Asegúrate de que la carpeta existe
const uploadDir = 'Imagenes/Pokemons';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuración del almacenamiento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    let nombre = req.body.nombre || 'pokemon'; // por si viene vacío
    nombre = nombre.toLowerCase().replace(/\s+/g, '_').replace(/[^\w\-]/g, '');
    const ext = path.extname(file.originalname);
    cb(null, `${nombre}${ext}`);
  }
});

// Solo permitir imágenes .jpg, .jpeg, .png
const fileFilter = (req, file, cb) => {
  const tiposPermitidos = /jpeg|jpg|png/;
  const esValido = tiposPermitidos.test(file.mimetype);
  if (esValido) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes jpg, jpeg o png'));
  }
};

const upload = multer({
  storage,
  fileFilter
});

module.exports = upload;
