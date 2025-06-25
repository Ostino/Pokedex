const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Entrenador = sequelize.define('Entrenador', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  rol: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  username: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

Entrenador.associate = (models) => {
  console.log('Ejecutando Entrenador.associate');

  Entrenador.hasMany(models.Equipo, {
    foreignKey: 'entrenadorId',
    as: 'equipos'
  });

  Entrenador.hasMany(models.Token, {
    foreignKey: 'entrenadorId',
    as: 'tokens',
    onDelete: 'CASCADE'
  });
};



module.exports = Entrenador;
