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
}, {
  // La contraseña nunca se carga salvo que se pida explícitamente con scope('conPassword').
  defaultScope: {
    attributes: { exclude: ['password'] }
  },
  scopes: {
    conPassword: { attributes: { include: ['password'] } }
  }
});

// Red de seguridad: aunque la instancia tenga la contraseña cargada, nunca se serializa.
Entrenador.prototype.toJSON = function () {
  const valores = { ...this.get({ plain: true }) };
  delete valores.password;
  return valores;
};

Entrenador.associate = (models) => {

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
