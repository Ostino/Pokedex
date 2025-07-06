const { PokemonBase, Tipo, Naturaleza, Habilidades, Objeto, Movimiento, StatsBase } = require('../models');
const fs = require('fs');
const path = require('path');

exports.crearPokemonBase = async (req, res) => {
  try {
    Object.keys(req.body).forEach(key => {
  if (req.body[key] === 'null') {
    req.body[key] = null;
  }
});
    console.log("Llegue al controlador de crear Pokemon")
    const data = req.body;
    console.log("Este es mi req.body",req.body)
    const existente = await PokemonBase.findOne({
      where: { numeroPokedex: data.numeroPokedex }
    });

    if (existente) {
      return res.status(409).json({ error: 'Ya existe un Pokémon con ese número en la Pokédex' });
    }

    if (req.file) {
      data.imagen = req.file.filename;
    }

    const nuevoPokemon = await PokemonBase.create(data);
    res.status(201).json(nuevoPokemon);
  } catch (error) {
        console.log("Este es el error ",error)

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
        { model: Habilidades, as: 'habilidad' },
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
        { model: Habilidades, as: 'habilidad' },
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

    const pokemon = await PokemonBase.findByPk(req.params.id);
    if (!pokemon) {
      return res.status(404).json({ error: 'Pokémon no encontrado para actualizar' });
    }

    if (data.numeroPokedex && data.numeroPokedex != pokemon.numeroPokedex) {
      const existente = await PokemonBase.findOne({
        where: { numeroPokedex: data.numeroPokedex }
      });

      if (existente) {
        return res.status(409).json({ error: 'Ya existe un Pokémon con ese número en la Pokédex' });
      }
    }

    if (req.file) {
      data.imagen = req.file.filename;
    } else if (data.nombre && data.nombre !== pokemon.nombre) {
      const extension = path.extname(pokemon.imagen);
      const nuevoNombreImagen = `${data.nombre}${extension}`;

      const rutaAnterior = path.join(__dirname, '..', 'Imagenes', 'Pokemons', pokemon.imagen);
      const rutaNueva = path.join(__dirname, '..', 'Imagenes', 'Pokemons', nuevoNombreImagen);

      if (fs.existsSync(rutaAnterior)) {
        fs.renameSync(rutaAnterior, rutaNueva);
        data.imagen = nuevoNombreImagen;
      } else {
        console.warn(`Imagen no encontrada para renombrar: ${rutaAnterior}`);
      }
    }

    await pokemon.update(data);

    res.json({ mensaje: 'Pokémon actualizado correctamente', pokemon });
  } catch (error) {
    res.status(400).json({ error: 'Error al actualizar el Pokémon', detalles: error.message });
  }
};

exports.eliminar = async (req, res) => {
  try {
    const pokemon = await PokemonBase.findByPk(req.params.id);

    if (!pokemon) {
      return res.status(404).json({ error: 'Pokémon no encontrado para eliminar' });
    }
    const rutaImagen = path.join(__dirname, '..', 'Imagenes', 'Pokemons', pokemon.imagen);

    if (fs.existsSync(rutaImagen)) {
      fs.unlinkSync(rutaImagen);
    }

    await pokemon.destroy();

    res.json({ mensaje: 'Pokémon eliminado correctamente, incluyendo su imagen.' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el Pokémon', detalles: error.message });
  }
};

exports.verificarNumeroPokedex = async (req, res) => {
  try {
    const { numeroPokedex } = req.params;

    const existe = await PokemonBase.findOne({
      where: { numeroPokedex }
    });

    if (existe) {
      return res.json({ existe: true, mensaje: 'El número Pokédex ya está registrado.' });
    }

    res.json({ existe: false, mensaje: 'Número Pokédex disponible.' });
  } catch (error) {
    res.status(500).json({ error: 'Error al verificar número Pokédex', detalles: error.message });
  }
};

exports.asignarStatsBase = async (req, res) => {
  console.log("llegue a asignar stats y este es mi body", res.body)
  const pokemonBaseId = req.params.id;
  const {
    ps,
    ataque,
    defensa,
    ataqueEspecial,
    defensaEspecial,
    velocidad
  } = req.body;

  try {
    const pokemon = await PokemonBase.findByPk(pokemonBaseId);

    if (!pokemon) {
      return res.status(404).json({ error: 'Pokémon Base no encontrado' });
    }

    const statsExistentes = await StatsBase.findOne({
      where: { pokemonBaseId }
    });

    if (statsExistentes) {
      return res.status(400).json({ error: 'Este Pokémon ya tiene stats asignados' });
    }

    const nuevosStats = await StatsBase.create({
      pokemonBaseId,
      ps,
      ataque,
      defensa,
      ataqueEspecial,
      defensaEspecial,
      velocidad
    });

    res.status(201).json(nuevosStats);
  } catch (error) {
    res.status(500).json({
      error: 'Error al asignar los stats base',
      detalles: error.message
    });
  }
};

exports.actualizarStatsBase = async (req, res) => {
  const pokemonBaseId = req.params.id;
  const {
    ps,
    ataque,
    defensa,
    ataqueEspecial,
    defensaEspecial,
    velocidad
  } = req.body;

  try {
    const stats = await StatsBase.findOne({
      where: { pokemonBaseId }
    });

    if (!stats) {
      return res.status(404).json({ error: 'Stats base no encontradas para este Pokémon' });
    }

    await stats.update({
      ps,
      ataque,
      defensa,
      ataqueEspecial,
      defensaEspecial,
      velocidad
    });

    return res.json({ mensaje: 'Stats base actualizadas correctamente', stats });
  } catch (error) {
    res.status(500).json({
      error: 'Error al actualizar los stats base',
      detalles: error.message
    });
  }
};

exports.obtenerStatsBasePorPokemonBaseId = async (req, res) => {
  try {
    const { id } = req.params;

    const stats = await StatsBase.findOne({
      where: { pokemonBaseId: id }
    });

    if (!stats) {
      return res.status(404).json({ error: 'Stats base no encontradas para este Pokémon' });
    }

    return res.json(stats);
  } catch (error) {
    console.error('Error al obtener stats base:', error);
    return res.status(500).json({ error: 'Error al obtener stats base', detalles: error.message });
  }
};