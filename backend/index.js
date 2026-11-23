// Arranque del servidor. La aplicación Express está en app.js (así los tests pueden usarla sin levantar el servidor).

require('./config/cargarEnv');

// En producción, sin secretos no se arranca. Se comprueba antes de cargar nada más.
if (process.env.NODE_ENV === 'production') {
  const faltan = ['JWT_SECRET', 'ADMIN_PASSWORD'].filter((nombre) => !process.env[nombre]);
  if (faltan.length > 0) {
    console.error(`Error: en producción es obligatorio definir ${faltan.join(' y ')}. El servidor no se iniciará.`);
    process.exit(1);
  }
}

const app = require('./app');
const inicializar = require('./inicializar');
const { iniciarLimpiezaDemo } = require('./limpiezaDemo');

async function iniciarServidor() {
  try {
    await inicializar();
    iniciarLimpiezaDemo();

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

iniciarServidor();
