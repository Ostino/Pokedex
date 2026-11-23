const { PokemonAlt, Tipo, Naturaleza, Habilidades, Movimiento, Objeto, Evs, Ivs, Stats, Equipo } = require('../models');
const { esAdmin, puedeAcceder } = require('../utils/permisos');

const INCLUDES = [
  { model: Tipo, as: 'tipoPrimario' },
  { model: Tipo, as: 'tipoSecundario' },
  { model: Naturaleza, as: 'naturaleza' },
  { model: Habilidades, as: 'habilidad' },
  { model: Movimiento, as: 'movimiento1' },
  { model: Movimiento, as: 'movimiento2' },
  { model: Movimiento, as: 'movimiento3' },
  { model: Movimiento, as: 'movimiento4' },
  { model: Objeto, as: 'objeto' },
  { model: Evs, as: 'evs' },
  { model: Ivs, as: 'ivs' },
  { model: Stats, as: 'stats' },
  { model: Equipo, as: 'equipo' }
];

class ErrorHttp extends Error {
  constructor(status, mensaje) {
    super(mensaje);
    this.status = status;
  }
}

// Comprueba el equipo destino y que los EVs/IVs no pertenezcan ya a otro Pokémon.
// Devuelve los datos listos para guardar, con entrenadorId tomado siempre del equipo.
async function prepararDatos(body, user, pokemonActual = null) {
  const { id, entrenadorId, ...datos } = body;

  const equipoId = datos.equipoId ?? pokemonActual?.equipoId;
  if (equipoId === undefined || equipoId === null) {
    throw new ErrorHttp(400, 'Es necesario indicar el equipo');
  }

  const equipo = await Equipo.findByPk(equipoId);
  if (!equipo) throw new ErrorHttp(404, 'Equipo no encontrado');
  if (!puedeAcceder(user, equipo.entrenadorId)) {
    throw new ErrorHttp(403, 'No tienes permiso para usar este equipo');
  }
  datos.entrenadorId = equipo.entrenadorId;

  for (const campo of ['evsId', 'ivsId']) {
    if (datos[campo] === undefined || datos[campo] === pokemonActual?.[campo]) continue;
    const otro = await PokemonAlt.findOne({ where: { [campo]: datos[campo] } });
    if (otro && otro.id !== pokemonActual?.id) {
      throw new ErrorHttp(400, `${campo} ya pertenece a otro Pokémon`);
    }
  }

  return datos;
}

exports.obtenerTodos = async (req, res) => {
  try {
    const where = esAdmin(req.user) ? {} : { entrenadorId: req.user.id };
    const pokemons = await PokemonAlt.findAll({ where, include: INCLUDES });
    res.json(pokemons);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener Pokémons alternativos', detalles: error.message });
  }
};

exports.obtenerPorId = async (req, res) => {
  try {
    const pokemon = await PokemonAlt.findByPk(req.params.id, { include: INCLUDES });

    if (!pokemon) return res.status(404).json({ error: 'Pokémon no encontrado' });
    if (!puedeAcceder(req.user, pokemon.entrenadorId)) {
      return res.status(403).json({ error: 'No tienes permiso para ver este Pokémon' });
    }

    res.json(pokemon);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener Pokémon', detalles: error.message });
  }
};

exports.obtenerPorEntrenadorId = async (req, res) => {
  try {
    const { entrenadorId } = req.params;
    if (!puedeAcceder(req.user, entrenadorId)) {
      return res.status(403).json({ error: 'No tienes permiso para ver los Pokémon de este entrenador' });
    }

    const pokemons = await PokemonAlt.findAll({ where: { entrenadorId }, include: INCLUDES });
    res.json(pokemons);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los Pokémon del entrenador', detalles: error.message });
  }
};

exports.obtenerPorEquipoId = async (req, res) => {
  try {
    const { equipoId } = req.params;
    const equipo = await Equipo.findByPk(equipoId);
    if (!equipo) return res.status(404).json({ error: 'Equipo no encontrado' });
    if (!puedeAcceder(req.user, equipo.entrenadorId)) {
      return res.status(403).json({ error: 'No tienes permiso para ver este equipo' });
    }

    const pokemons = await PokemonAlt.findAll({ where: { equipoId }, include: INCLUDES });
    res.json(pokemons);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los Pokémon del equipo', detalles: error.message });
  }
};

exports.crear = async (req, res) => {
  try {
    const datos = await prepararDatos(req.body, req.user);
    const nuevo = await PokemonAlt.create(datos);
    res.status(201).json(nuevo);
  } catch (error) {
    res.status(error.status || 400).json({ error: 'Error al crear Pokémon', detalles: error.message });
  }
};

exports.actualizar = async (req, res) => {
  try {
    const pokemon = await PokemonAlt.findByPk(req.params.id);
    if (!pokemon) return res.status(404).json({ error: 'Pokémon no encontrado' });
    if (!puedeAcceder(req.user, pokemon.entrenadorId)) {
      return res.status(403).json({ error: 'No tienes permiso para modificar este Pokémon' });
    }

    const datos = await prepararDatos(req.body, req.user, pokemon);
    await pokemon.update(datos);
    res.json(pokemon);
  } catch (error) {
    res.status(error.status || 400).json({ error: 'Error al actualizar Pokémon', detalles: error.message });
  }
};

exports.eliminarPokemonAlt = async (req, res) => {
  try {
    const id = req.params.id;

    const pokemon = await PokemonAlt.findByPk(id);
    if (!pokemon) {
      return res.status(404).json({ error: 'PokémonAlt no encontrado' });
    }
    if (!puedeAcceder(req.user, pokemon.entrenadorId)) {
      return res.status(403).json({ error: 'No tienes permiso para eliminar este Pokémon' });
    }

    await Stats.destroy({ where: { pokemonAltId: id } });

    await PokemonAlt.destroy({ where: { id } });

    if (pokemon.evsId) await Evs.destroy({ where: { id: pokemon.evsId } });
    if (pokemon.ivsId) await Ivs.destroy({ where: { id: pokemon.ivsId } });

    return res.json({ mensaje: 'PokémonAlt y sus datos relacionados eliminados correctamente' });

  } catch (error) {
    console.error('❌ Error al eliminar PokémonAlt:', error);
    return res.status(500).json({ error: 'Error al eliminar PokémonAlt', detalles: error.message });
  }
};
