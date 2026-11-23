const { Stats, PokemonAlt } = require('../models');
const { esAdmin, puedeAcceder } = require('../utils/permisos');

// Las stats pertenecen al dueño de su PokémonAlt.
const buscarConDueno = (id) =>
  Stats.findByPk(id, {
    include: { model: PokemonAlt, as: 'pokemonAlt', attributes: ['id', 'entrenadorId'] }
  });

const sinPokemonAlt = (stats) => {
  const { pokemonAlt, ...resto } = stats.toJSON();
  return resto;
};

exports.crearStats = async (req, res) => {
  try {
    const { id, ...datos } = req.body;
    const pokemon = datos.pokemonAltId && await PokemonAlt.findByPk(datos.pokemonAltId);
    if (!pokemon) return res.status(404).json({ error: 'Pokémon no encontrado' });
    if (!puedeAcceder(req.user, pokemon.entrenadorId)) {
      return res.status(403).json({ error: 'No tienes permiso para modificar este Pokémon' });
    }

    const nuevo = await Stats.create(datos);
    res.status(201).json({ id: nuevo.id });
  } catch (error) {
    res.status(400).json({ error: 'Error al crear stats', detalles: error.message });
  }
};

exports.obtenerTodos = async (req, res) => {
  try {
    const todos = esAdmin(req.user)
      ? await Stats.findAll()
      : await Stats.findAll({
          include: {
            model: PokemonAlt,
            as: 'pokemonAlt',
            attributes: [],
            where: { entrenadorId: req.user.id }
          }
        });
    res.json(todos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener stats', detalles: error.message });
  }
};

exports.obtenerPorId = async (req, res) => {
  try {
    const stats = await buscarConDueno(req.params.id);
    if (!stats) {
      return res.status(404).json({ error: 'Stats no encontrado' });
    }
    if (!puedeAcceder(req.user, stats.pokemonAlt?.entrenadorId)) {
      return res.status(403).json({ error: 'No tienes permiso para ver estas stats' });
    }
    res.json(sinPokemonAlt(stats));
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener stats', detalles: error.message });
  }
};

exports.actualizar = async (req, res) => {
  try {
    const stats = await buscarConDueno(req.params.id);
    if (!stats) {
      return res.status(404).json({ error: 'Stats no encontrado' });
    }
    if (!puedeAcceder(req.user, stats.pokemonAlt?.entrenadorId)) {
      return res.status(403).json({ error: 'No tienes permiso para modificar estas stats' });
    }
    // No se permite mover las stats a otro Pokémon.
    const { id, pokemonAltId, ...datos } = req.body;
    await stats.update(datos);
    res.json({ id: stats.id });
  } catch (error) {
    res.status(400).json({ error: 'Error al actualizar stats', detalles: error.message });
  }
};

exports.eliminar = async (req, res) => {
  try {
    const stats = await buscarConDueno(req.params.id);
    if (!stats) {
      return res.status(404).json({ error: 'Stats no encontrado para eliminar' });
    }
    if (!puedeAcceder(req.user, stats.pokemonAlt?.entrenadorId)) {
      return res.status(403).json({ error: 'No tienes permiso para eliminar estas stats' });
    }
    await stats.destroy();
    res.json({ mensaje: 'Stats eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar stats', detalles: error.message });
  }
};
