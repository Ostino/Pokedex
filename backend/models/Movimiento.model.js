const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Movimiento = sequelize.define('Movimiento', {
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
  tipoId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Tipos',
      key: 'id'
    },
    allowNull: false
  },
  potencia: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  pp: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  precision: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  categoriaMovimientoId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'CategoriaMovs',
      key: 'id'
    },
    allowNull: false
  }
});

Movimiento.associate = (models) => {
  Movimiento.belongsTo(models.Tipo, {
    foreignKey: 'tipoId',
    as: 'tipo'
  });

  Movimiento.belongsTo(models.CategoriaMov, {
    foreignKey: 'categoriaMovimientoId',
    as: 'categoriamovimiento'
  });
};

module.exports = Movimiento;
