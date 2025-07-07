const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const app = express();
const sequelize = require('./config/database');
const authRoutes = require('./routes/Auth.routes');
const entrenadorRoutes = require('./routes/Entrenador.routes');
const habilidadesRoutes = require('./routes/Habilidad.route');
const movimientosRoutes  =require('./routes/Movimiento.routes');
const objetoRoutes = require('./routes/Objetos.routes');
const categoriamovRoutes =require('./routes/CategoriaMov.routes');
const tipoRoutes = require('./routes/Tipo.routes');
const pokemonBaseRoutes = require('./routes/PokemonBase.route');
const naturalezaRoutes = require('./routes/Naturaleza.routes');
const equipoRoutes = require('./routes/Equipos.routes');
const pokemonAltRoutes = require('./routes/PokemonAlt.routes')
const ivsRoutes = require('./routes/IVs.routes')
const evsRoutes = require('./routes/EVs.routes')
const statsRoutes = require('./routes/Stats.routes')
//401 No hay token
//403 Se requiere admin 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.get('/', (req, res) => {
  res.send('¡Hola, mundo desde Express!');
});

async function iniciarServidor() {
  try {
    await sequelize.authenticate();
    console.log('Conexión exitosa a la base de datos');

    //await sequelize.sync({ force: true });
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
app.use('/api/categoriamov',categoriamovRoutes);
app.use('/api/tipos', tipoRoutes);
app.use('/api/pokemonbase', pokemonBaseRoutes);
app.use('/api/naturalezas', naturalezaRoutes);
app.use('/api/equipos',equipoRoutes);
app.use('/api/pokemonalt',pokemonAltRoutes);
app.use('/api/ivs',ivsRoutes)
app.use('/api/evs',evsRoutes)
app.use('/api/stats',statsRoutes)

const  Entrenador  = require('./models/Entrenador.model');
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
      email: 'admin@email.com',
      rol: 2,
    });

    console.log('Usuario admin creado:', nuevoAdmin.username);
  } catch (error) {
    console.error('Error creando usuario admin:', error);
  }
}