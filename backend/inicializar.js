const bcrypt = require('bcryptjs');
const { sequelize, Entrenador } = require('./models');
const { ROL_ADMIN, ROL_USUARIO } = require('./utils/permisos');

// Crea la cuenta o, si ya existe, solo actualiza su contraseña.
async function asegurarCuenta({ username, password, email, rol }) {
  const hash = await bcrypt.hash(password, 10);
  const existente = await Entrenador.findOne({ where: { username } });

  if (existente) {
    existente.password = hash;
    await existente.save();
    console.log(`Contraseña de "${username}" actualizada desde las variables de entorno`);
  } else {
    await Entrenador.create({ username, password: hash, email, rol });
    console.log(`Usuario "${username}" creado`);
  }
}

async function configurarAdmin() {
  if (process.env.ADMIN_PASSWORD) {
    await asegurarCuenta({
      username: 'admin',
      password: process.env.ADMIN_PASSWORD,
      email: 'admin@email.com',
      rol: ROL_ADMIN,
    });
    return;
  }

  // Sin ADMIN_PASSWORD (solo posible fuera de producción): no se crea ni se toca el admin.
  const admin = await Entrenador.scope('conPassword').findOne({ where: { username: 'admin' } });
  if (!admin) {
    console.warn('⚠️  No existe el usuario admin. Define ADMIN_PASSWORD para crearlo.');
  } else if (await bcrypt.compare('admin', admin.password)) {
    console.warn('⚠️  El usuario admin usa la contraseña "admin" de la semilla. Define ADMIN_PASSWORD para cambiarla.');
  }
}

async function configurarDemo() {
  if (!process.env.DEMO_PASSWORD) return;
  await asegurarCuenta({
    username: 'demo',
    password: process.env.DEMO_PASSWORD,
    email: 'demo@pokedex.local',
    rol: ROL_USUARIO,
  });
}

// Prepara la base de trabajo: crea las tablas que falten (nunca borra ni altera las existentes)
// y configura las cuentas admin y demo.
async function inicializar() {
  await sequelize.authenticate();
  console.log('Conexión exitosa a la base de datos');

  await sequelize.sync();
  console.log('Tablas sincronizadas correctamente');

  await configurarAdmin();
  await configurarDemo();
}

module.exports = inicializar;
