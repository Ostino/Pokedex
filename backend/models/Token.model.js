const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Token = sequelize.define('Token', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  token: {
    type: DataTypes.STRING,
    allowNull: false
  },
  entrenadorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Entrenadors', 
      key: 'id'
    },
  }
});

Token.associate = (models) => {
  Token.belongsTo(models.Entrenador, {
    foreignKey: 'entrenadorId',
    as: 'entrenador',
  });
};

module.exports = Token;