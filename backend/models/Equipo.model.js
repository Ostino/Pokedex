const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Equipo = sequelize.define('Equipo', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  entrenadorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Entrenadors', 
      key: 'id'
    },
  },
});

// Relación con Entrenador
Equipo.associate = (models) => {
  Equipo.belongsTo(models.Entrenador, {
    foreignKey: 'entrenadorId',
    as: 'entrenador',
    onDelete: 'CASCADE'
  });
  Equipo.hasMany(models.PokemonAlt, {
    foreignKey: 'equipoId',
    as: 'pokemonAlts'
  });

};

module.exports = Equipo;
