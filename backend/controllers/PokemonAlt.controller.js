const { PokemonAlt, Tipo, Naturaleza, Habilidades, Movimiento, Objeto, Evs, Ivs, Stats, Equipo } = require('../models');

exports.obtenerTodos = async (req, res) => {
  try {
    const pokemons = await PokemonAlt.findAll({
      include: [
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
      ]
    });
    res.json(pokemons);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener Pokémons alternativos', detalles: error.message });
  }
};

exports.obtenerPorId = async (req, res) => {
  try {
    const pokemon = await PokemonAlt.findByPk(req.params.id, {
      include: [
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
      ]
    });

    if (!pokemon) return res.status(404).json({ error: 'Pokémon no encontrado' });

    res.json(pokemon);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener Pokémon', detalles: error.message });
  }
};
exports.obtenerPorEntrenadorId = async (req, res) => {
  try {
    const { entrenadorId } = req.params;

    const pokemons = await PokemonAlt.findAll({
      where: { entrenadorId },
      include: [
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
      ]
    });

    res.json(pokemons);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los Pokémon del entrenador', detalles: error.message });
  }
};
exports.crear = async (req, res) => {
  try {
    const data = req.body;
    const nuevo = await PokemonAlt.create(data);
    res.status(201).json(nuevo);
  } catch (error) {
    res.status(400).json({ error: 'Error al crear Pokémon', detalles: error.message });
  }
};


exports.actualizar = async (req, res) => {
  try {
    const pokemon = await PokemonAlt.findByPk(req.params.id);
    if (!pokemon) return res.status(404).json({ error: 'Pokémon no encontrado' });

    await pokemon.update(req.body);
    res.json(pokemon);
  } catch (error) {
    res.status(400).json({ error: 'Error al actualizar Pokémon', detalles: error.message });
  }
};

exports.eliminarPokemonAlt = async (req, res) => {
  try {
    const id = req.params.id;
    console.log("Se está por borrar el PokémonAlt con id:", id);

    // 1. Buscar el PokémonAlt
    const pokemon = await PokemonAlt.findByPk(id);
    if (!pokemon) {
      return res.status(404).json({ error: 'PokémonAlt no encontrado' });
    }

    // 2. Eliminar primero las Stats asociadas (si existen)
    await Stats.destroy({ where: { pokemonAltId: id } });

    // 3. Eliminar el PokémonAlt
    await PokemonAlt.destroy({ where: { id } });

    // 4. Eliminar EVs e IVs asociados
    if (pokemon.evsId) await Evs.destroy({ where: { id: pokemon.evsId } });
    if (pokemon.ivsId) await Ivs.destroy({ where: { id: pokemon.ivsId } });

    return res.json({ mensaje: 'PokémonAlt y sus datos relacionados eliminados correctamente' });

  } catch (error) {
    console.error('❌ Error al eliminar PokémonAlt:', error);
    return res.status(500).json({ error: 'Error al eliminar PokémonAlt', detalles: error.message });
  }
};


