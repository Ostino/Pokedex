const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PokemonAlt = sequelize.define('PokemonAlt', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },

  entrenadorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Entrenadors',
      key: 'id'
    }
  },
  
  equipoId: {
  type: DataTypes.INTEGER,
  allowNull: false,
  references: {
    model: 'Equipos',
    key: 'id'
  },
  onDelete: 'CASCADE'
},

  imagen: {
    type: DataTypes.STRING,
    allowNull: true
  },
  
  numeroPokedex: {
    type: DataTypes.INTEGER,
    allowNull: false
},
  tipoPrimarioId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Tipos',
      key: 'id'
    }
  },

  tipoSecundarioId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Tipos',
      key: 'id'
    }
  },

  naturalezaId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Naturalezas',
      key: 'id'
    }
  },

  habilidadId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Habilidades',
      key: 'id'
    }
  },

  movimiento1Id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Movimientos',
      key: 'id'
    }
  },

  movimiento2Id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Movimientos',
      key: 'id'
    }
  },

  movimiento3Id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Movimientos',
      key: 'id'
    }
  },

  movimiento4Id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Movimientos',
      key: 'id'
    }
  },

  objetoId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Objetos',
      key: 'id'
    }
  },

  evsId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Evs',
      key: 'id'
    },
     onDelete: 'CASCADE'
  },

  ivsId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Ivs',
      key: 'id'
    },
     onDelete: 'CASCADE'
  }
});

PokemonAlt.associate = (models) => {
  PokemonAlt.belongsTo(models.Entrenador, { foreignKey: 'entrenadorId', as: 'entrenador' });
  PokemonAlt.belongsTo(models.Equipo, { foreignKey: 'equipoId', as: 'equipo' });

  PokemonAlt.belongsTo(models.Tipo, { foreignKey: 'tipoPrimarioId', as: 'tipoPrimario' });
  PokemonAlt.belongsTo(models.Tipo, { foreignKey: 'tipoSecundarioId', as: 'tipoSecundario' });

  PokemonAlt.belongsTo(models.Naturaleza, { foreignKey: 'naturalezaId', as: 'naturaleza' });
  PokemonAlt.belongsTo(models.Habilidades, { foreignKey: 'habilidadId', as: 'habilidad' });

  PokemonAlt.belongsTo(models.Movimiento, { foreignKey: 'movimiento1Id', as: 'movimiento1' });
  PokemonAlt.belongsTo(models.Movimiento, { foreignKey: 'movimiento2Id', as: 'movimiento2' });
  PokemonAlt.belongsTo(models.Movimiento, { foreignKey: 'movimiento3Id', as: 'movimiento3' });
  PokemonAlt.belongsTo(models.Movimiento, { foreignKey: 'movimiento4Id', as: 'movimiento4' });

  PokemonAlt.belongsTo(models.Objeto, { foreignKey: 'objetoId', as: 'objeto' });

  PokemonAlt.belongsTo(models.Evs, { foreignKey: 'evsId', as: 'evs' });
  PokemonAlt.belongsTo(models.Ivs, { foreignKey: 'ivsId', as: 'ivs' });

  PokemonAlt.hasOne(models.Stats, { foreignKey: 'pokemonAltId', as: 'stats' });
};

module.exports = PokemonAlt;
