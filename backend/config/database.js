const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database/Pokebase.sqlite',
  logging: false
});

module.exports =  sequelize ;
