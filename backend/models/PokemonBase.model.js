const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const PokemonBase = sequelize.define('PokemonBase', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  numeroPokedex: {
  type: DataTypes.INTEGER,
  allowNull: false,
  unique: true
},
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  imagen: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  tipoPrimarioId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Tipos',
      key: 'id',
    },
    allowNull: false
  },
  tipoSecundarioId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Tipos',
      key: 'id',
    },
    allowNull: true
  },
  naturalezaId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Naturalezas',
      key: 'id',
    },
    allowNull: false
  },
  habilidadId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Habilidades',
      key: 'id',
    },
    allowNull: false
  },
  objetoId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Objetos',
      key: 'id',
    },
    allowNull: true
  },
  movimiento1Id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Movimientos',
      key: 'id',
    },
    allowNull: false
  },
  movimiento2Id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Movimientos',
      key: 'id',
    },
    allowNull: true
  },
  movimiento3Id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Movimientos',
      key: 'id',
    },
    allowNull: true
  },
  movimiento4Id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Movimientos',
      key: 'id',
    },
    allowNull: true
  }
});

PokemonBase.associate = (models) => {
  PokemonBase.belongsTo(models.Tipo, { foreignKey: 'tipoPrimarioId', as: 'tipoPrimario' });
  PokemonBase.belongsTo(models.Tipo, { foreignKey: 'tipoSecundarioId', as: 'tipoSecundario' });

  PokemonBase.belongsTo(models.Naturaleza, { foreignKey: 'naturalezaId', as: 'naturaleza' });
  PokemonBase.belongsTo(models.Habilidades, { foreignKey: 'habilidadId', as: 'habilidad' });
  PokemonBase.belongsTo(models.Objeto, { foreignKey: 'objetoId', as: 'objeto' });

  PokemonBase.belongsTo(models.Movimiento, { foreignKey: 'movimiento1Id', as: 'movimiento1' });
  PokemonBase.belongsTo(models.Movimiento, { foreignKey: 'movimiento2Id', as: 'movimiento2' });
  PokemonBase.belongsTo(models.Movimiento, { foreignKey: 'movimiento3Id', as: 'movimiento3' });
  PokemonBase.belongsTo(models.Movimiento, { foreignKey: 'movimiento4Id', as: 'movimiento4' });

 PokemonBase.hasOne(models.StatsBase, {
    foreignKey: 'pokemonBaseId',
    as: 'statsBase'
  });
};

module.exports = PokemonBase;
