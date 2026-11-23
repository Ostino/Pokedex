const fs = require('fs');
const path = require('path');
const { Sequelize } = require('sequelize');
const { RUTA_SEMILLA, RUTA_BD } = require('./rutas');

if (path.resolve(RUTA_BD) === path.resolve(RUTA_SEMILLA)) {
  throw new Error('DB_PATH no puede apuntar a la base semilla (database/Pokebase.sqlite)');
}

// Para reiniciar la demo en local basta con borrar la base de trabajo.
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
