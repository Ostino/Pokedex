const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Habilidades = sequelize.define('Habilidades', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
});

module.exports = Habilidades;
