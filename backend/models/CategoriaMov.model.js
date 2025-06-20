const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CategoriaMov = sequelize.define('CategoriaMov', {
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
  imagen: {
    type: DataTypes.STRING,
    allowNull: true
  }
});

module.exports = CategoriaMov;
