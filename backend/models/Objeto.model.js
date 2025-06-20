const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Objeto = sequelize.define('Objeto', {
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
    imagen: {
    type: DataTypes.STRING,
    allowNull: false,
  }
});

module.exports = Objeto;
