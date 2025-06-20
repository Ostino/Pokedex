const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Evs = sequelize.define('Evs', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  ps: { type: DataTypes.INTEGER, defaultValue: 0 },
  ataque: { type: DataTypes.INTEGER, defaultValue: 0 },
  defensa: { type: DataTypes.INTEGER, defaultValue: 0 },
  ataqueEspecial: { type: DataTypes.INTEGER, defaultValue: 0 },
  defensaEspecial: { type: DataTypes.INTEGER, defaultValue: 0 },
  velocidad: { type: DataTypes.INTEGER, defaultValue: 0 }
});

module.exports = Evs;
