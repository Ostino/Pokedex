const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

// Configuración antes de cargar la app: base temporal (copia de la semilla), nunca la semilla.
const DIR_TEMPORAL = fs.mkdtempSync(path.join(os.tmpdir(), 'pokedex-test-limpieza-'));
process.env.NODE_ENV = 'test';
process.env.DB_PATH = path.join(DIR_TEMPORAL, 'test.sqlite');
process.env.JWT_SECRET = 'secreto-de-test';
process.env.ADMIN_PASSWORD = 'admin-de-test';
process.env.DEMO_PASSWORD = 'demo-de-test';
process.env.DEMO_LIMPIEZA_MINUTOS = '10'; // los tests no arrancan el temporizador; llaman a la limpieza a mano

const request = require('supertest');
const app = require('../app');
const inicializar = require('../inicializar');
const { limpiarDatosDemo } = require('../limpiezaDemo');
const m = require('../models');

const RUTA_SEMILLA = path.join(__dirname, '..', 'database', 'Pokebase.sqlite');
const MINUTO = 60 * 1000;
const CATALOGO = ['PokemonBase', 'StatsBase', 'Objeto', 'Movimiento', 'Tipo', 'Naturaleza', 'Habilidades', 'CategoriaMov'];
const DE_USUARIO = ['Entrenador', 'Equipo', 'PokemonAlt', 'Stats', 'Evs', 'Ivs'];

let mtimeSemilla;
let datosIniciales; // filas de usuario tal como vienen de la semilla (más admin/demo)
let catalogoInicial;

const contar = async (modelos) =>
  Object.fromEntries(await Promise.all(modelos.map(async (n) => [n, await m[n].count()])));
const idsDe = async (modelo) => (await m[modelo].findAll({ attributes: ['id'] })).map((f) => f.id);

const conToken = (token) => ({ Authorization: `Bearer ${token}` });
async function sesion(username, password) {
  const res = await request(app).post('/api/auth/login').send({ username, password });
  assert.equal(res.status, 200, `login de ${username}`);
  return res.body.token;
}

// Crea un equipo con un Pokémon completo (EVs, IVs, stats) usando la API, como lo hace el frontend.
async function crearEquipoConPokemon(token, nombre) {
  const h = conToken(token);
  const equipo = (await request(app).post('/api/equipos').set(h).send({ nombre })).body;
  const evs = (await request(app).post('/api/evs').set(h).send({ ps: 4 })).body;
  const ivs = (await request(app).post('/api/ivs').set(h).send({ ps: 31 })).body;
  const [tipo, nat, hab, mov] = await Promise.all([m.Tipo, m.Naturaleza, m.Habilidades, m.Movimiento].map((x) => x.findOne()));
  const pokemon = await request(app).post('/api/pokemonalt').set(h).send({
    equipoId: equipo.id, numeroPokedex: 6, tipoPrimarioId: tipo.id, naturalezaId: nat.id,
    habilidadId: hab.id, movimiento1Id: mov.id, evsId: evs.id, ivsId: ivs.id,
  });
  assert.equal(pokemon.status, 201, JSON.stringify(pokemon.body));
  const stats = await request(app).post('/api/stats').set(h).send({
    ps: 1, ataque: 1, defensa: 1, ataqueEspecial: 1, defensaEspecial: 1, velocidad: 1, pokemonAltId: pokemon.body.id,
  });
  assert.equal(stats.status, 201);
  return { equipoId: equipo.id, pokemonId: pokemon.body.id, evsId: evs.id, ivsId: ivs.id, statsId: stats.body.id };
}

let visitante, tokenVisitante, demoDatos, evsSuelto;

before(async () => {
  mtimeSemilla = fs.statSync(RUTA_SEMILLA).mtimeMs;
  await inicializar();

  datosIniciales = Object.fromEntries(await Promise.all(DE_USUARIO.map(async (n) => [n, await idsDe(n)])));
  catalogoInicial = await contar(CATALOGO);

  // Un visitante se registra y arma un equipo.
  await request(app).post('/api/auth/register').send({ username: 'visitante', password: 'clave-visitante', email: 'v@test.local' });
  tokenVisitante = await sesion('visitante', 'clave-visitante');
  visitante = await crearEquipoConPokemon(tokenVisitante, 'Equipo del visitante');

  // Con la cuenta demo se crea otro equipo, y queda un EV suelto (sin Pokémon).
  const tokenDemo = await sesion('demo', 'demo-de-test');
  demoDatos = await crearEquipoConPokemon(tokenDemo, 'Equipo de demo');
  evsSuelto = (await request(app).post('/api/evs').set(conToken(tokenDemo)).send({ ps: 8 })).body;
});

after(async () => {
  await m.sequelize.close();
  fs.rmSync(DIR_TEMPORAL, { recursive: true, force: true });
});

test('con menos de 10 minutos de antigüedad no se borra nada', async () => {
  const antes = await contar([...DE_USUARIO, 'Token']);
  const resumen = await limpiarDatosDemo({ minutos: 10, ahora: new Date(Date.now() + 5 * MINUTO) });

  assert.deepEqual(resumen, { cuentas: 0, equipos: 0, pokemon: 0, sueltos: 0 });
  assert.deepEqual(await contar([...DE_USUARIO, 'Token']), antes);
});

test('GET /api/demo informa de la limpieza y de la cuenta demo', async () => {
  const res = await request(app).get('/api/demo');
  assert.equal(res.status, 200);
  assert.deepEqual(res.body, { limpiezaMinutos: 10, usuarioDemo: 'demo' });
});

test('POST /api/auth/demo entra con la cuenta demo (rol entrenador) sin contraseña', async () => {
  const res = await request(app).post('/api/auth/demo');
  assert.equal(res.status, 200);
  const me = await request(app).get('/api/entrenadores/me').set(conToken(res.body.token));
  assert.equal(me.body.username, 'demo');
  assert.equal(me.body.rol, 1);
});

test('/api/entrenadores/me dice a cada cuenta qué le pasará con la limpieza', async () => {
  const perfil = async (token) =>
    (await request(app).get('/api/entrenadores/me').set(conToken(token))).body.limpiezaDemo;

  // Visitante: su cuenta caduca 10 minutos después de crearse.
  const deVisitante = await perfil(tokenVisitante);
  const creada = (await m.Entrenador.findOne({ where: { username: 'visitante' } })).createdAt;
  assert.equal(deVisitante.minutos, 10);
  assert.equal(deVisitante.equiposTemporales, true);
  assert.equal(new Date(deVisitante.cuentaExpiraEn).getTime(), new Date(creada).getTime() + 10 * MINUTO);

  // demo: la cuenta se queda, sus equipos no.
  assert.deepEqual(await perfil(await sesion('demo', 'demo-de-test')), { minutos: 10, cuentaExpiraEn: null, equiposTemporales: true });
  // admin: no se toca nada.
  assert.deepEqual(await perfil(await sesion('admin', 'admin-de-test')), { minutos: 10, cuentaExpiraEn: null, equiposTemporales: false });
});

test('pasados 10 minutos se borran los datos de visitantes y de la cuenta demo', async () => {
  const resumen = await limpiarDatosDemo({ minutos: 10, ahora: new Date(Date.now() + 11 * MINUTO) });
  assert.deepEqual(resumen, { cuentas: 1, equipos: 2, pokemon: 2, sueltos: 1 });

  // Visitante: cuenta, sesiones, equipo, Pokémon, stats, EVs e IVs.
  assert.equal(await m.Entrenador.count({ where: { username: 'visitante' } }), 0);
  for (const datos of [visitante, demoDatos]) {
    assert.equal(await m.Equipo.count({ where: { id: datos.equipoId } }), 0);
    assert.equal(await m.PokemonAlt.count({ where: { id: datos.pokemonId } }), 0);
    assert.equal(await m.Stats.count({ where: { id: datos.statsId } }), 0);
    assert.equal(await m.Evs.count({ where: { id: datos.evsId } }), 0);
    assert.equal(await m.Ivs.count({ where: { id: datos.ivsId } }), 0);
  }
  assert.equal(await m.Evs.count({ where: { id: evsSuelto.id } }), 0);

  const res = await request(app).get('/api/entrenadores/me').set(conToken(tokenVisitante));
  assert.equal(res.status, 401, 'la sesión del visitante borrado ya no sirve');
  assert.equal(res.body.codigo, 'CUENTA_ELIMINADA', 'el 401 explica que la cuenta ya no existe');
});

test('admin, demo, los datos de la semilla y el catálogo se conservan', async () => {
  // Todo lo que había al arrancar (semilla + admin + demo) sigue ahí, y no queda nada más.
  for (const modelo of DE_USUARIO) {
    assert.deepEqual((await idsDe(modelo)).sort(), [...datosIniciales[modelo]].sort(), modelo);
  }
  assert.deepEqual(await contar(CATALOGO), catalogoInicial);

  await sesion('admin', 'admin-de-test');
  await sesion('demo', 'demo-de-test');
});

test('la limpieza no modifica la base semilla', () => {
  assert.equal(fs.statSync(RUTA_SEMILLA).mtimeMs, mtimeSemilla);
});
