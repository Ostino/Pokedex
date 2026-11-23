// Carga backend/.env si existe (desarrollo local). En Render no hay .env: las variables se
// definen en el panel. Las variables ya definidas en el entorno tienen prioridad sobre el archivo.
const fs = require('fs');
const path = require('path');

const RUTA_ENV = path.join(__dirname, '..', '.env');

if (fs.existsSync(RUTA_ENV)) {
  process.loadEnvFile(RUTA_ENV);
}
