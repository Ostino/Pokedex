const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

// Configuración antes de cargar la app: base temporal (copia de la semilla), nunca la semilla.
const DIR_TEMPORAL = fs.mkdtempSync(path.join(os.tmpdir(), 'pokedex-test-'));
process.env.NODE_ENV = 'test';
process.env.DB_PATH = path.join(DIR_TEMPORAL, 'test.sqlite');
process.env.JWT_SECRET = 'secreto-de-test';
process.env.ADMIN_PASSWORD = 'admin-de-test';
delete process.env.DEMO_PASSWORD;

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../app');
const inicializar = require('../inicializar');
const { sequelize, Token } = require('../models');

const RUTA_SEMILLA = path.join(__dirname, '..', 'database', 'Pokebase.sqlite');
let mtimeSemilla;

const login = (username, password) =>
  request(app).post('/api/auth/login').send({ username, password });

before(async () => {
  mtimeSemilla = fs.statSync(RUTA_SEMILLA).mtimeMs;
  await inicializar();
});

after(async () => {
  await sequelize.close();
  fs.rmSync(DIR_TEMPORAL, { recursive: true, force: true });
});

test('GET /api/health responde 200', async () => {
  const res = await request(app).get('/api/health');
  assert.equal(res.status, 200);
  assert.deepEqual(res.body, { status: 'ok' });
});

test('una ruta de la API que no existe da 404 en JSON', async () => {
  const res = await request(app).get('/api/no-existe');
  assert.equal(res.status, 404);
  assert.match(res.headers['content-type'], /json/);
});

test('login admin/admin falla cuando ADMIN_PASSWORD es otra', async () => {
  const res = await login('admin', 'admin');
  assert.equal(res.status, 401);
  assert.equal(res.body.token, undefined);
});

test('login correcto devuelve un token que da acceso a /api/entrenadores/me', async () => {
  const res = await login('admin', 'admin-de-test');
  assert.equal(res.status, 200);
  assert.ok(res.body.token);

  const me = await request(app)
    .get('/api/entrenadores/me')
    .set('Authorization', `Bearer ${res.body.token}`);
  assert.equal(me.status, 200);
  assert.equal(me.body.username, 'admin');
});

test('un JWT firmado con otro secreto recibe 401 aunque esté en la tabla Tokens, y se borra', async () => {
  const falso = jwt.sign({ id: 1, rol: 2, username: 'admin' }, 'otro-secreto', { expiresIn: '1d' });
  await Token.create({ token: falso, entrenadorId: 1 });

  const res = await request(app).get('/api/entrenadores/me').set('Authorization', `Bearer ${falso}`);
  assert.equal(res.status, 401);
  assert.equal(await Token.count({ where: { token: falso } }), 0);
});

test('un JWT vencido recibe 401 aunque esté en la tabla Tokens, y se borra', async () => {
  const vencido = jwt.sign(
    { id: 1, rol: 2, username: 'admin', exp: Math.floor(Date.now() / 1000) - 60 },
    process.env.JWT_SECRET
  );
  await Token.create({ token: vencido, entrenadorId: 1 });

  const res = await request(app).get('/api/entrenadores/me').set('Authorization', `Bearer ${vencido}`);
  assert.equal(res.status, 401);
  assert.equal(await Token.count({ where: { token: vencido } }), 0);
});

test('POST /api/auth/register no devuelve la contraseña', async () => {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ username: 'nuevo', password: 'clave-nueva', email: 'nuevo@test.local' });
  assert.equal(res.status, 201);
  assert.deepEqual(Object.keys(res.body.entrenador).sort(), ['email', 'id', 'rol', 'username']);
  assert.ok(!JSON.stringify(res.body).includes('password'));
});

test('un usuario con rol 1 recibe 403 en /api/entrenadores/admin', async () => {
  await request(app)
    .post('/api/auth/register')
    .send({ username: 'entrenador', password: 'clave-entrenador', email: 'entrenador@test.local' });
  const { body } = await login('entrenador', 'clave-entrenador');

  const res = await request(app)
    .get('/api/entrenadores/admin')
    .set('Authorization', `Bearer ${body.token}`);
  assert.equal(res.status, 403);
});

test('los tests no modifican la base semilla', () => {
  assert.equal(fs.statSync(RUTA_SEMILLA).mtimeMs, mtimeSemilla);
});
