const multer = require('multer');
const path = require('path');
const fs = require('fs');

const dir = 'Imagenes/Objetos';
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    let nombre = req.body.nombre || 'objeto';
    nombre = nombre.toLowerCase().replace(/\s+/g, '_').replace(/[^\w\-]/g, '');
    const ext = path.extname(file.originalname);
    cb(null, `${nombre}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const permitido = /jpeg|jpg|png/;
  cb(null, permitido.test(file.mimetype));
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
