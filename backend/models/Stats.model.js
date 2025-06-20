const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Stats = sequelize.define('Stats', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  ps: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  ataque: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  defensa: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  ataqueEspecial: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  defensaEspecial: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  velocidad: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  // FK para relacionar con PokemonAlt, si es el Stats de un PokemonAlt
  pokemonAltId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: 'PokemonAlts',
      key: 'id'
    },
    onDelete: 'CASCADE'
  }
});

Stats.associate = (models) => {
  Stats.belongsTo(models.PokemonAlt, {
    foreignKey: 'pokemonAltId',
    as: 'pokemonAlt'
  });
};

module.exports = Stats;
