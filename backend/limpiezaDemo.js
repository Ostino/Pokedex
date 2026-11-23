// Limpieza periódica de la demo pública.
//
// Borra lo que crean los visitantes cuando tiene más de N minutos:
//   - Cuentas registradas que no están en la semilla, con sus sesiones, equipos y Pokémon.
//   - Equipos y Pokémon creados con la cuenta `demo` (la cuenta se mantiene).
//   - EVs, IVs y stats sueltos (sin Pokémon que los use) que no están en la semilla.
// Nunca toca `admin`, `demo`, los datos que vienen en la semilla ni el catálogo
// (Pokémon base, objetos, movimientos, tipos, naturalezas, habilidades).
//
// Solo se activa con la variable DEMO_LIMPIEZA_MINUTOS.

const { Op, Sequelize } = require('sequelize');
const sqlite3 = require('sqlite3');
const { sequelize, Entrenador, Equipo, PokemonAlt, Stats, Evs, Ivs, Token } = require('./models');
const { RUTA_SEMILLA } = require('./config/rutas');

const USUARIOS_PROTEGIDOS = ['admin', 'demo'];
const MODELOS_SEMILLA = { Entrenador, Equipo, PokemonAlt, Stats, Evs, Ivs };

let idsSemilla = null;
let limpiando = false;

// IDs de las filas que vienen en la semilla, leídos directamente del archivo (en solo lectura).
async function cargarIdsSemilla() {
  if (idsSemilla) return idsSemilla;

  const semilla = new Sequelize({
    dialect: 'sqlite',
    storage: RUTA_SEMILLA,
    logging: false,
    dialectOptions: { mode: sqlite3.OPEN_READONLY },
  });
  try {
    const ids = {};
    for (const [nombre, modelo] of Object.entries(MODELOS_SEMILLA)) {
      const [filas] = await semilla.query(`SELECT id FROM "${modelo.getTableName()}"`);
      ids[nombre] = filas.map((fila) => fila.id);
    }
    idsSemilla = ids;
    return ids;
  } finally {
    await semilla.close();
  }
}

// Condiciones auxiliares. Con listas vacías no se genera `NOT IN ()`, que en SQL no filtra como se espera.
const fueraDe = (campo, ids) => (ids.length ? { [campo]: { [Op.notIn]: ids } } : {});
const dentroDe = (campo, ids) => ({ [campo]: { [Op.in]: ids } });
const ids = (filas, campo = 'id') => [...new Set(filas.map((f) => f[campo]).filter((v) => v != null))];

async function borrarPokemon(pokemons, transaction) {
  if (!pokemons.length) return 0;
  const pokemonIds = ids(pokemons);
  // Orden por las claves foráneas: stats → Pokémon → EVs/IVs.
  await Stats.destroy({ where: dentroDe('pokemonAltId', pokemonIds), transaction });
  await PokemonAlt.destroy({ where: dentroDe('id', pokemonIds), transaction });
  await Evs.destroy({ where: dentroDe('id', ids(pokemons, 'evsId')), transaction });
  await Ivs.destroy({ where: dentroDe('id', ids(pokemons, 'ivsId')), transaction });
  return pokemonIds.length;
}

async function limpiarDatosDemo({ minutos, ahora = new Date() }) {
  const semilla = await cargarIdsSemilla();
  const antiguo = { createdAt: { [Op.lt]: new Date(ahora.getTime() - minutos * 60 * 1000) } };

  return sequelize.transaction(async (transaction) => {
    const resumen = { cuentas: 0, equipos: 0, pokemon: 0, sueltos: 0 };

    // 1. Cuentas de visitantes con más de N minutos: se borran con todo lo suyo.
    const visitantes = await Entrenador.findAll({
      where: {
        ...fueraDe('id', semilla.Entrenador),
        username: { [Op.notIn]: USUARIOS_PROTEGIDOS },
        ...antiguo,
      },
      attributes: ['id'],
      transaction,
    });
    const visitanteIds = ids(visitantes);

    // 2. Equipos y Pokémon de la cuenta demo con más de N minutos (los de la semilla se respetan).
    const demo = await Entrenador.findOne({ where: { username: 'demo' }, attributes: ['id'], transaction });
    const equiposDemo = demo
      ? await Equipo.findAll({
          where: { entrenadorId: demo.id, ...fueraDe('id', semilla.Equipo), ...antiguo },
          attributes: ['id'],
          transaction,
        })
      : [];
    const equipoDemoIds = ids(equiposDemo);

    const condicionesPokemon = [dentroDe('entrenadorId', visitanteIds), dentroDe('equipoId', equipoDemoIds)];
    if (demo) {
      condicionesPokemon.push({ entrenadorId: demo.id, ...fueraDe('id', semilla.PokemonAlt), ...antiguo });
    }
    const pokemons = await PokemonAlt.findAll({
      where: { [Op.or]: condicionesPokemon },
      attributes: ['id', 'evsId', 'ivsId'],
      transaction,
    });
    resumen.pokemon = await borrarPokemon(pokemons, transaction);

    resumen.equipos = await Equipo.destroy({
      where: { [Op.or]: [dentroDe('entrenadorId', visitanteIds), dentroDe('id', equipoDemoIds)] },
      transaction,
    });

    if (visitanteIds.length) {
      await Token.destroy({ where: dentroDe('entrenadorId', visitanteIds), transaction });
      resumen.cuentas = await Entrenador.destroy({ where: dentroDe('id', visitanteIds), transaction });
    }

    // 3. Restos sueltos: EVs/IVs que ningún Pokémon usa y stats sin Pokémon.
    const enUso = await PokemonAlt.findAll({ attributes: ['id', 'evsId', 'ivsId'], transaction });
    // Ojo: una sola condición por campo (dos `fueraDe('id', …)` con spread se pisarían).
    resumen.sueltos += await Evs.destroy({
      where: { ...fueraDe('id', [...semilla.Evs, ...ids(enUso, 'evsId')]), ...antiguo },
      transaction,
    });
    resumen.sueltos += await Ivs.destroy({
      where: { ...fueraDe('id', [...semilla.Ivs, ...ids(enUso, 'ivsId')]), ...antiguo },
      transaction,
    });
    resumen.sueltos += await Stats.destroy({
      where: { ...fueraDe('id', semilla.Stats), ...fueraDe('pokemonAltId', ids(enUso)), ...antiguo },
      transaction,
    });

    return resumen;
  });
}

// Programa la limpieza si DEMO_LIMPIEZA_MINUTOS está definida. Revisa cada minuto
// (o antes si el plazo es menor), así cada dato vive como mucho N minutos más uno.
function iniciarLimpiezaDemo() {
  const valor = process.env.DEMO_LIMPIEZA_MINUTOS;
  if (!valor) return null;

  const minutos = Number(valor);
  if (!Number.isFinite(minutos) || minutos <= 0) {
    console.warn(`⚠️  DEMO_LIMPIEZA_MINUTOS="${valor}" no es un número de minutos válido: limpieza desactivada.`);
    return null;
  }

  const ejecutar = async () => {
    if (limpiando) return;
    limpiando = true;
    try {
      const r = await limpiarDatosDemo({ minutos });
      if (r.cuentas || r.equipos || r.pokemon || r.sueltos) {
        console.log(`Limpieza de la demo: ${r.cuentas} cuenta(s), ${r.equipos} equipo(s), ${r.pokemon} Pokémon y ${r.sueltos} registro(s) sueltos borrados.`);
      }
    } catch (error) {
      console.error('Error en la limpieza de la demo:', error);
    } finally {
      limpiando = false;
    }
  };

  const intervalo = setInterval(ejecutar, Math.min(60 * 1000, minutos * 60 * 1000));
  intervalo.unref();
  console.log(`Limpieza de la demo activada: se borran los datos de visitantes con más de ${minutos} minutos.`);
  ejecutar();
  return intervalo;
}

module.exports = { limpiarDatosDemo, iniciarLimpiezaDemo };
