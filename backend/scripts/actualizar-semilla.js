// Copia la base de trabajo sobre la semilla versionada (database/Pokebase.sqlite)
// y vacía la tabla Tokens para que ninguna sesión acabe en git.
// Uso (con el servidor detenido): npm run semilla
const fs = require('fs');
const path = require('path');
const { Sequelize } = require('sequelize');

const BACKEND_DIR = path.join(__dirname, '..');
const RUTA_SEMILLA = path.join(BACKEND_DIR, 'database', 'Pokebase.sqlite');
const RUTA_BD = process.env.DB_PATH
  ? path.resolve(BACKEND_DIR, process.env.DB_PATH)
  : path.join(BACKEND_DIR, 'database', 'pokebase.runtime.sqlite');

(async () => {
  if (!fs.existsSync(RUTA_BD)) {
    console.error(`No existe la base de trabajo: ${RUTA_BD}`);
    process.exit(1);
  }

  fs.copyFileSync(RUTA_BD, RUTA_SEMILLA);

  const semilla = new Sequelize({ dialect: 'sqlite', storage: RUTA_SEMILLA, logging: false });
  await semilla.query('DELETE FROM Tokens');
  await semilla.query('VACUUM');
  await semilla.close();

  console.log('Semilla actualizada y tabla Tokens vaciada.');
})().catch((error) => {
  console.error('Error al actualizar la semilla:', error.message);
  process.exit(1);
});
