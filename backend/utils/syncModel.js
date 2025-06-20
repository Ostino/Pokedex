const models = require('../models');

async function syncModels({ force = false, alter = false } = {}) {
  const { sequelize: _, Sequelize, ...entities } = models;

  // Llamar associate solo aquí
  for (const model of Object.values(entities)) {
    if (model.associate) model.associate(entities);
  }

  // Sincronizar modelos
  for (const model of Object.values(entities)) {
    await model.sync({ force, alter });
    console.log(`✅ Modelo sincronizado: ${model.name}`);
  }
}

module.exports = syncModels;
