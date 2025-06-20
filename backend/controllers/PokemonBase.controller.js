const { PokemonBase, Tipo, Naturaleza, Habilidad, Objeto, Movimiento, StatsBase } = require('../models');

exports.crearPokemonBase = async (req, res) => {
  try {
    const data = req.body;

    if (req.file) {
      data.imagen = `/Imagenes/Pokemons/${req.file.filename}`;
    }

    const nuevoPokemon = await PokemonBase.create(data);
    res.status(201).json(nuevoPokemon);
  } catch (error) {
    res.status(400).json({ error: 'Error al crear el Pokémon', detalles: error.message });
  }
};

exports.obtenerTodos = async (req, res) => {
  try {
    const pokemons = await PokemonBase.findAll({
      include: [
        { model: Tipo, as: 'tipoPrimario' },
        { model: Tipo, as: 'tipoSecundario' },
        { model: Naturaleza, as: 'naturaleza' },
        { model: Habilidad, as: 'habilidad' },
        { model: Objeto, as: 'objeto' },
        { model: Movimiento, as: 'movimiento1' },
        { model: Movimiento, as: 'movimiento2' },
        { model: Movimiento, as: 'movimiento3' },
        { model: Movimiento, as: 'movimiento4' },
        { model: StatsBase, as: 'statsBase' }
      ]
    });
    res.json(pokemons);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los Pokémon', detalles: error.message });
  }
};

exports.obtenerPorId = async (req, res) => {
  try {
    const pokemon = await PokemonBase.findByPk(req.params.id, {
      include: [
        { model: Tipo, as: 'tipoPrimario' },
        { model: Tipo, as: 'tipoSecundario' },
        { model: Naturaleza, as: 'naturaleza' },
        { model: Habilidad, as: 'habilidad' },
        { model: Objeto, as: 'objeto' },
        { model: Movimiento, as: 'movimiento1' },
        { model: Movimiento, as: 'movimiento2' },
        { model: Movimiento, as: 'movimiento3' },
        { model: Movimiento, as: 'movimiento4' },
        { model: StatsBase, as: 'statsBase' }
      ]
    });

    if (!pokemon) {
      return res.status(404).json({ error: 'Pokémon no encontrado' });
    }

    res.json(pokemon);
  } catch (error) {
    res.status(500).json({ error: 'Error al buscar el Pokémon', detalles: error.message });
  }
};

exports.actualizar = async (req, res) => {
  try {
    const data = req.body;

    if (req.file) {
      data.imagen = `/Imagenes/Pokemons/${req.file.filename}`;
    }

    const actualizado = await PokemonBase.update(data, {
      where: { id: req.params.id }
    });

    if (actualizado[0] === 0) {
      return res.status(404).json({ error: 'Pokémon no encontrado para actualizar' });
    }

    res.json({ mensaje: 'Pokémon actualizado correctamente' });
  } catch (error) {
    res.status(400).json({ error: 'Error al actualizar el Pokémon', detalles: error.message });
  }
};

exports.eliminar = async (req, res) => {
  try {
    const eliminado = await PokemonBase.destroy({
      where: { id: req.params.id }
    });

    if (!eliminado) {
      return res.status(404).json({ error: 'Pokémon no encontrado para eliminar' });
    }

    res.json({ mensaje: 'Pokémon eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el Pokémon', detalles: error.message });
  }
};
