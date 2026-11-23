const fs = require('fs');
const path = require('path');
const { Sequelize } = require('sequelize');

const BACKEND_DIR = path.join(__dirname, '..');

// Base versionada en git: semilla de solo lectura, nunca se abre directamente.
const RUTA_SEMILLA = path.join(BACKEND_DIR, 'database', 'Pokebase.sqlite');

// Base de trabajo (ignorada por git). Si no existe, se crea copiando la semilla.
// Para reiniciar la demo en local basta con borrarla.
const RUTA_BD = process.env.DB_PATH
  ? path.resolve(BACKEND_DIR, process.env.DB_PATH)
  : path.join(BACKEND_DIR, 'database', 'pokebase.runtime.sqlite');

if (path.resolve(RUTA_BD) === path.resolve(RUTA_SEMILLA)) {
  throw new Error('DB_PATH no puede apuntar a la base semilla (database/Pokebase.sqlite)');
}

if (!fs.existsSync(RUTA_BD)) {
  fs.mkdirSync(path.dirname(RUTA_BD), { recursive: true });
  fs.copyFileSync(RUTA_SEMILLA, RUTA_BD);
  console.log(`Base de trabajo creada a partir de la semilla: ${RUTA_BD}`);
}

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: RUTA_BD,
  logging: false
});

module.exports = sequelize;
