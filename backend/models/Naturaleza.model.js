const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Naturaleza = sequelize.define('Naturaleza', {
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
  statAumentada: {
    type: DataTypes.STRING,
    allowNull: true
  },
  statReducida: {
    type: DataTypes.STRING,
    allowNull: true
  }
});

module.exports = Naturaleza;
