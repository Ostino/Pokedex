const { PokemonAlt } = require('../models');
const { esAdmin, puedeAcceder } = require('./permisos');

// EVs e IVs no guardan dueño: pertenecen al entrenador del PokémonAlt que los referencia
// (campo `campoPokemon`). Si aún no los usa ningún Pokémon, solo un admin puede leerlos o editarlos.
module.exports = function crearControlador(Modelo, campoPokemon, nombre) {
  const tienePermiso = async (user, id) => {
    const pokemon = await PokemonAlt.findOne({ where: { [campoPokemon]: id } });
    return pokemon ? puedeAcceder(user, pokemon.entrenadorId) : esAdmin(user);
  };

  return {
    crear: async (req, res) => {
      try {
        const { id, ...datos } = req.body;
        const nuevo = await Modelo.create(datos);
        res.status(201).json({ id: nuevo.id });
      } catch (error) {
        res.status(400).json({ error: `Error al crear ${nombre}`, detalles: error.message });
      }
    },

    obtenerTodos: async (req, res) => {
      try {
        if (esAdmin(req.user)) return res.json(await Modelo.findAll());

        const pokemons = await PokemonAlt.findAll({
          where: { entrenadorId: req.user.id },
          attributes: [campoPokemon]
        });
        const ids = pokemons.map((p) => p[campoPokemon]);
        res.json(await Modelo.findAll({ where: { id: ids } }));
      } catch (error) {
        res.status(500).json({ error: `Error al obtener ${nombre}`, detalles: error.message });
      }
    },

    obtenerPorId: async (req, res) => {
      try {
        const registro = await Modelo.findByPk(req.params.id);
        if (!registro) {
          return res.status(404).json({ error: `${nombre} no encontrado` });
        }
        if (!(await tienePermiso(req.user, registro.id))) {
          return res.status(403).json({ error: `No tienes permiso para ver estos ${nombre}` });
        }
        res.json(registro);
      } catch (error) {
        res.status(500).json({ error: `Error al obtener ${nombre}`, detalles: error.message });
      }
    },

    actualizar: async (req, res) => {
      try {
        const registro = await Modelo.findByPk(req.params.id);
        if (!registro) {
          return res.status(404).json({ error: `${nombre} no encontrado para actualizar` });
        }
        if (!(await tienePermiso(req.user, registro.id))) {
          return res.status(403).json({ error: `No tienes permiso para modificar estos ${nombre}` });
        }
        const { id, ...datos } = req.body;
        await registro.update(datos);
        res.json({ id: registro.id });
      } catch (error) {
        res.status(400).json({ error: `Error al actualizar ${nombre}`, detalles: error.message });
      }
    },
  };
};
