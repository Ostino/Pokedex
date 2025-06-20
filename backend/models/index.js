const { Sequelize } = require('sequelize');
const sequelize = require('../config/database');

// Importación de modelos
const Token = require('./Token.model');
const Entrenador = require('./Entrenador.model');
const Equipo = require('./Equipo.model');
const PokemonBase = require('./PokemonBase.model');
const StatsBase = require('./StatsBase.model');
const PokemonAlt = require('./PokemonAlt.model');
const Stats = require('./Stats.model');
const Tipo = require('./Tipo.model');
const Naturaleza = require('./Naturaleza.model');
const Habilidades = require('./Habilidades.model');
const Objeto = require('./Objeto.model');
const Movimiento = require('./Movimiento.model');
const CategoriaMov = require('./CategoriaMov.model');
const Evs = require('./Evs.model');
const Ivs = require('./Ivs.model');

// Registro de modelos
const models = {
  sequelize,
  Sequelize,
  Entrenador,
  Equipo,
  PokemonBase,
  StatsBase,
  PokemonAlt,
  Stats,
  Token,
  Tipo,
  Naturaleza,
  Habilidades,
  Objeto,
  Movimiento,
  CategoriaMov,
  Evs,
  Ivs
};
Object.values(models).forEach(model => {
  if (model.associate) {
    model.associate(models);
  }
});
module.exports = models;
