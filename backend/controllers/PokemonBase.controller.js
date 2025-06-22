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
    // Validar duplicado en numeroPokedex
    const existente = await PokemonBase.findOne({
      where: { numeroPokedex: data.numeroPokedex }
    });

    if (existente) {
      return res.status(409).json({ error: 'Ya existe un Pokémon con ese número en la Pokédex' });
    }

    // Si se subió imagen, agregarla
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

    // Validar duplicado en numeroPokedex si llega uno nuevo
    if (data.numeroPokedex && data.numeroPokedex != pokemon.numeroPokedex) {
      const existente = await PokemonBase.findOne({
        where: { numeroPokedex: data.numeroPokedex }
      });

      if (existente) {
        return res.status(409).json({ error: 'Ya existe un Pokémon con ese número en la Pokédex' });
      }
    }

    // Si llega nueva imagen
    if (req.file) {
      data.imagen = req.file.filename;
    } else if (data.nombre && data.nombre !== pokemon.nombre) {
      // Si cambia el nombre, renombrar imagen existente
      const extension = path.extname(pokemon.imagen); // Ej: .png
      const nuevoNombreImagen = `${data.nombre}${extension}`;

      const rutaAnterior = path.join(__dirname, '..', 'Imagenes', 'Pokemons', pokemon.imagen);
      const rutaNueva = path.join(__dirname, '..', 'Imagenes', 'Pokemons', nuevoNombreImagen);

      if (fs.existsSync(rutaAnterior)) {
        fs.renameSync(rutaAnterior, rutaNueva);
        data.imagen = nuevoNombreImagen;
      } else {
        console.warn(`⚠️ Imagen no encontrada para renombrar: ${rutaAnterior}`);
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
    // Buscar el Pokémon primero para obtener el nombre del archivo de imagen
    const pokemon = await PokemonBase.findByPk(req.params.id);

    if (!pokemon) {
      return res.status(404).json({ error: 'Pokémon no encontrado para eliminar' });
    }

    // Ruta completa al archivo de imagen
    const rutaImagen = path.join(__dirname, '..', 'Imagenes', 'Pokemons', pokemon.imagen);

    // Eliminar la imagen si existe
    if (fs.existsSync(rutaImagen)) {
      fs.unlinkSync(rutaImagen);
    }

    // Eliminar el Pokémon de la base de datos
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
