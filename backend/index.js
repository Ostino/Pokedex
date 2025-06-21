const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const app = express();
const sequelize = require('./config/database');
const syncModels = require('./utils/syncModel');
const authRoutes = require('./routes/Auth.routes');
const entrenadorRoutes = require('./routes/Entrenador.routes');
const habilidadesRoutes = require('./routes/Habilidad.route');
const movimientosRoutes  =require('./routes/Movimiento.routes');
const objetoRoutes = require('./routes/Objetos.routes');
//401 No hay token
//403 Se requiere admin 
app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send('¡Hola, mundo desde Express!');
});

async function iniciarServidor() {
  try {
    await sequelize.authenticate();
    console.log('Conexión exitosa a la base de datos');

    //await syncModels({ force: true });
    console.log('Tablas sincronizadas correctamente');
    await crearAdminSiNoExiste();
    const PORT = 3000;
    app.listen(PORT, () => {
      console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Error al conectar con la base de datos:', error);
  }
}
iniciarServidor();

app.use('/api/auth', authRoutes);
app.use('/api/entrenadores', entrenadorRoutes);
app.use('/Imagenes', express.static(path.join(__dirname, 'Imagenes')));
app.use('/api/habilidades', habilidadesRoutes);
app.use('/api/movimientos', movimientosRoutes);
app.use('/api/objetos',objetoRoutes);




const  Entrenador  = require('./models/Entrenador.model');
async function asignarAdmin(id) {
  const usuario = await Entrenador.findOne({ where: { id } });

  if (usuario) {
    if (usuario.rol !== 2) {
      usuario.rol = 2;
      await usuario.save();
      console.log(`El usuario ${usuario.id} ahora es admin (rol 2)`);
    } else {
      console.log(`ℹEl usuario ${usuario.id} ya es admin`);
    }
  } else {
    console.log('No se encontró el usuario para hacer admin');
  }
}

async function crearAdminSiNoExiste() {
  try {
    const adminExistente = await Entrenador.findOne({ where: { username: 'admin' } });
    if (adminExistente) {
      console.log('El usuario admin ya existe');
      return;
    }

    const passwordHash = await bcrypt.hash('admin', 10);

    const nuevoAdmin = await Entrenador.create({
      username: 'admin',
      password: passwordHash,
      rol: 2, // admin
    });

    console.log('Usuario admin creado:', nuevoAdmin.username);
  } catch (error) {
    console.error('Error creando usuario admin:', error);
  }
}