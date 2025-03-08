/**
 * Inicialización de modelos y sincronización con la base de datos
 */
const { sequelize, testConnection } = require('../config/database');
const User = require('./User');

// Exportar todos los modelos
const models = {
  User
};

// Función para sincronizar la base de datos
const sincronizarDB = async (force = true) => {
  try {
    // Probar la conexión
    const connected = await testConnection();
    if (!connected) {
      console.error('No se pudo establecer conexión con la base de datos.');
      return false;
    }

    // Sincronizar modelos con la base de datos
    // force: true recreará las tablas si ya existen
    await sequelize.sync({ force });
    console.log('Base de datos sincronizada correctamente.');
    
    return true;
  } catch (error) {
    console.error('Error al sincronizar la base de datos:', error);
    return false;
  }
};

module.exports = {
  ...models,
  sequelize,
  sincronizarDB
};
