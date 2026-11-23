const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/Auth.routes');
const entrenadorRoutes = require('./routes/Entrenador.routes');
const habilidadesRoutes = require('./routes/Habilidad.route');
const movimientosRoutes = require('./routes/Movimiento.routes');
const objetoRoutes = require('./routes/Objetos.routes');
const categoriamovRoutes = require('./routes/CategoriaMov.routes');
const tipoRoutes = require('./routes/Tipo.routes');
const pokemonBaseRoutes = require('./routes/PokemonBase.route');
const naturalezaRoutes = require('./routes/Naturaleza.routes');
const equipoRoutes = require('./routes/Equipos.routes');
const pokemonAltRoutes = require('./routes/PokemonAlt.routes');
const ivsRoutes = require('./routes/IVs.routes');
const evsRoutes = require('./routes/EVs.routes');
const statsRoutes = require('./routes/Stats.routes');
const { manejarErrorSubida } = require('./middlewares/limitesSubida');
const { minutosLimpieza } = require('./limpiezaDemo');

const app = express();

//401 No hay token
//403 Se requiere admin
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Health check para Render: no toca la base de datos.
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Configuración pública de la demo, para que el frontend pueda avisar (no toca la base de datos).
app.get('/api/demo', (req, res) => {
  res.json({
    limpiezaMinutos: minutosLimpieza(),
    usuarioDemo: process.env.DEMO_PASSWORD ? 'demo' : null,
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/entrenadores', entrenadorRoutes);
app.use('/Imagenes', express.static(path.join(__dirname, 'Imagenes')));
app.use('/api/habilidades', habilidadesRoutes);
app.use('/api/movimientos', movimientosRoutes);
app.use('/api/objetos', objetoRoutes);
app.use('/api/categoriamov', categoriamovRoutes);
app.use('/api/tipos', tipoRoutes);
app.use('/api/pokemonbase', pokemonBaseRoutes);
app.use('/api/naturalezas', naturalezaRoutes);
app.use('/api/equipos', equipoRoutes);
app.use('/api/pokemonalt', pokemonAltRoutes);
app.use('/api/ivs', ivsRoutes);
app.use('/api/evs', evsRoutes);
app.use('/api/stats', statsRoutes);

// Cualquier otra ruta de la API es un 404 en JSON (nunca el index.html del frontend).
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Frontend compilado (frontend/dist). Si no existe, por ejemplo en desarrollo, solo se sirve la API.
const FRONTEND_DIST = path.join(__dirname, '..', 'frontend', 'dist');
if (fs.existsSync(path.join(FRONTEND_DIST, 'index.html'))) {
  app.use(express.static(FRONTEND_DIST));

  // Respaldo de la SPA: las rutas internas (/login, /profile...) devuelven index.html al recargar.
  // /Imagenes/* queda fuera para que una imagen inexistente siga dando 404.
  app.get('/{*splat}', (req, res, next) => {
    if (/^\/(api|Imagenes)(\/|$)/.test(req.path)) return next();
    res.sendFile(path.join(FRONTEND_DIST, 'index.html'));
  });
}

app.use(manejarErrorSubida);

module.exports = app;
