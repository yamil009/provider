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
    
    // Crear el usuario especial "yamil" si no existe
    const usuarioAdmin = await User.findOne({ where: { username: 'yamil' } });
    if (!usuarioAdmin) {
      await User.create({
        username: 'yamil',
        password: '0000',
        totalUsos: 999999,  // Prácticamente ilimitado
        usosRestantes: 999999,
        activo: true,
        esAdmin: true // Campo especial para marcar como administrador
      });
      console.log('Usuario administrador "yamil" creado correctamente.');
    }
    
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
