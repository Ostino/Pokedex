const path = require('path');

const BACKEND_DIR = path.join(__dirname, '..');

// Base versionada en git: semilla de solo lectura, nunca se abre para escribir (salvo `npm run semilla`).
const RUTA_SEMILLA = path.join(BACKEND_DIR, 'database', 'Pokebase.sqlite');

// Base de trabajo (ignorada por git). Si no existe, se crea copiando la semilla.
const RUTA_BD = process.env.DB_PATH
  ? path.resolve(BACKEND_DIR, process.env.DB_PATH)
  : path.join(BACKEND_DIR, 'database', 'pokebase.runtime.sqlite');

module.exports = { RUTA_SEMILLA, RUTA_BD };
