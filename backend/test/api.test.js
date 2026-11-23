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

// --- Validación del registro y de la edición de cuentas ---

const registrar = (datos) => request(app).post('/api/auth/register').send(datos);
const VALIDO = { username: 'valido', password: 'clave-valida', email: 'valido@test.local' };

test('el registro rechaza datos que faltan o son inválidos con 400 y un mensaje claro', async () => {
  const casos = [
    [{}, /obligatorio/],
    [{ ...VALIDO, username: undefined }, /usuario es obligatorio/],
    [{ ...VALIDO, password: undefined }, /contraseña es obligatoria/],
    [{ ...VALIDO, email: undefined }, /email es obligatorio/],
    [{ ...VALIDO, username: '' }, /usuario es obligatorio/],
    [{ ...VALIDO, username: '   ' }, /usuario es obligatorio/],
    [{ ...VALIDO, username: 'ab' }, /entre 3 y 30/],
    [{ ...VALIDO, username: 'a'.repeat(31) }, /entre 3 y 30/],
    [{ ...VALIDO, username: 'ash ketchum' }, /solo puede tener/],
    [{ ...VALIDO, username: 'ñandú' }, /solo puede tener/],
    [{ ...VALIDO, username: 12345 }, /usuario es obligatorio/],
    [{ ...VALIDO, password: '' }, /contraseña es obligatoria/],
    [{ ...VALIDO, password: '12345' }, /al menos 6/],
    [{ ...VALIDO, password: 'x'.repeat(73) }, /demasiado larga/],
    [{ ...VALIDO, email: 'hola' }, /email no es válido/],
    [{ ...VALIDO, email: 'a@b' }, /email no es válido/],
  ];
  for (const [datos, mensaje] of casos) {
    const res = await registrar(datos);
    assert.equal(res.status, 400, `${JSON.stringify(datos)} -> ${res.status}`);
    assert.match(res.body.error, mensaje, JSON.stringify(datos));
  }
});

test('no se puede registrar un usuario que imite a otro (mayúsculas o espacios)', async () => {
  for (const username of ['admin', 'ADMIN', ' admin ', 'Admin']) {
    const res = await registrar({ ...VALIDO, username, email: `${Math.random()}@test.local` });
    assert.equal(res.status, 400, username);
    assert.equal(res.body.error, 'Ese nombre de usuario ya está en uso');
  }
});

test('un email ya registrado (aunque cambien las mayúsculas) da 400, no 500', async () => {
  const res = await registrar({ ...VALIDO, username: 'otro-admin', email: 'ADMIN@email.com' });
  assert.equal(res.status, 400);
  assert.equal(res.body.error, 'Ese email ya está registrado');
});

test('un registro válido guarda el usuario sin espacios, el email en minúsculas y rol 1 aunque pida otro', async () => {
  const res = await registrar({ username: '  Ash.K_1  ', password: 'pikachu1', email: ' Ash@Kanto.COM ', rol: 2 });
  assert.equal(res.status, 201);
  assert.deepEqual(
    { username: res.body.entrenador.username, email: res.body.entrenador.email, rol: res.body.entrenador.rol },
    { username: 'Ash.K_1', email: 'ash@kanto.com', rol: 1 }
  );
  assert.equal((await login('Ash.K_1', 'pikachu1')).status, 200);
});

test('al editar la cuenta se aplican las mismas reglas', async () => {
  await registrar({ username: 'editable', password: 'clave-editable', email: 'editable@test.local' });
  const { body } = await login('editable', 'clave-editable');
  const me = await request(app).get('/api/entrenadores/me').set('Authorization', `Bearer ${body.token}`);
  const actualizar = (datos) =>
    request(app).put(`/api/entrenadores/actualizar/${me.body.id}`).set('Authorization', `Bearer ${body.token}`).send(datos);

  assert.equal((await actualizar({ username: ' ADMIN ' })).body.error, 'Ese nombre de usuario ya está en uso');
  assert.match((await actualizar({ username: 'no valido' })).body.error, /solo puede tener/);
  assert.match((await actualizar({ password: '123' })).body.error, /al menos 6/);

  const ok = await actualizar({ username: 'Editable2', password: 'otra-clave' });
  assert.equal(ok.status, 200);
  assert.equal((await login('Editable2', 'otra-clave')).status, 200);
});

test('el admin puede cambiar contraseñas desde el panel y se valida la nueva', async () => {
  const admin = (await login('admin', 'admin-de-test')).body.token;
  await registrar({ username: 'olvidadizo', password: 'clave-vieja', email: 'olvidadizo@test.local' });
  const { body: usuario } = await login('olvidadizo', 'clave-vieja');
  const { body: perfil } = await request(app).get('/api/entrenadores/me').set('Authorization', `Bearer ${usuario.token}`);
  const cambiar = (nuevaPassword) =>
    request(app).patch(`/api/entrenadores/${perfil.id}/cambiar-password`).set('Authorization', `Bearer ${admin}`).send({ nuevaPassword });

  assert.match((await cambiar('123')).body.error, /al menos 6/);
  assert.equal((await cambiar('clave-nueva')).status, 200);
  assert.equal((await login('olvidadizo', 'clave-nueva')).status, 200);
});

test('sin DEMO_LIMPIEZA_MINUTOS no hay avisos de limpieza', async () => {
  const demo = await request(app).get('/api/demo');
  assert.deepEqual(demo.body, { limpiezaMinutos: null, usuarioDemo: null });

  const { body } = await login('admin', 'admin-de-test');
  const me = await request(app).get('/api/entrenadores/me').set('Authorization', `Bearer ${body.token}`);
  assert.equal(me.body.limpiezaDemo, null);
});

test('un token cerrado con logout da 401 sin el código de cuenta eliminada', async () => {
  const { body } = await login('admin', 'admin-de-test');
  await request(app).post('/api/auth/logout').set('Authorization', `Bearer ${body.token}`);
  const res = await request(app).get('/api/entrenadores/me').set('Authorization', `Bearer ${body.token}`);
  assert.equal(res.status, 401);
  assert.equal(res.body.codigo, undefined);
});

test('sin DEMO_PASSWORD no se puede entrar con la cuenta demo por el atajo', async () => {
  const res = await request(app).post('/api/auth/demo');
  assert.equal(res.status, 404);
  assert.equal(res.body.token, undefined);
});

test('los tests no modifican la base semilla', () => {
  assert.equal(fs.statSync(RUTA_SEMILLA).mtimeMs, mtimeSemilla);
});
