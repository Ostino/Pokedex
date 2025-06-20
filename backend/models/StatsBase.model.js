const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const StatsBase = sequelize.define('StatsBase', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
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
  pokemonBaseId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: 'PokemonBases',
      key: 'id'
    },
    onDelete: 'CASCADE'
  }
});

StatsBase.associate = (models) => {
  StatsBase.belongsTo(models.PokemonBase, {
    foreignKey: 'pokemonBaseId',
    as: 'pokemonBase'
  });
};

module.exports = StatsBase;
