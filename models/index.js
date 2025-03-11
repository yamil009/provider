/**
 * Inicialización de modelos y sincronización con la base de datos
 */
const { sequelize, testConnection } = require('../config/database');
const User = require('./User');
const Acceso = require('./Acceso');

// Exportar todos los modelos
const models = {
  User,
  Acceso
};

// Verificar entorno Railway
const isRailway = !!process.env.RAILWAY_SERVICE_NAME;

// Función para sincronizar la base de datos
const sincronizarDB = async (force = false) => {
  try {
    console.log('Intentando conectar a la base de datos MySQL...');
    
    // No volver a mostrar la configuración aquí, evitamos confusiones
    // Ya se muestra en database.js
    
    // Probar la conexión
    const connected = await testConnection();
    if (!connected) {
      console.error('No se pudo establecer conexión con la base de datos.');
      return false;
    }

    // Sincronizar modelos con la base de datos
    // force: true recreará las tablas si ya existen
    await sequelize.sync({ force: force, alter: !force });
    console.log('Modelos sincronizados con la base de datos');

    // Verificar si es necesario configurar el usuario administrador
    const setupRequired = await User.count() === 0;
    if (setupRequired) {
      // Crear usuario administrador si no existe
      console.log('Configurando usuario administrador...');
      
      // Obtener fecha y hora actuales
      const now = new Date();
      const fecha = now.toISOString().split('T')[0]; // YYYY-MM-DD
      const hora = now.toTimeString().split(' ')[0]; // HH:MM:SS
      
      await User.create({
        username: process.env.ADMIN_USERNAME || 'yamil',
        password: process.env.ADMIN_PASSWORD || '74250853',
        nombre: 'Administrador',
        apellidos: 'Del Sistema',
        email: 'admin@sistema.com',
        activo: true,
        fechaCreacion: fecha,
        horaCreacion: hora
      });
      console.log('Usuario administrador creado con éxito');
    }

    return true;
  } catch (error) {
    console.error('Error al sincronizar con la base de datos:', error);
    return false;
  }
};

module.exports = {
  ...models,
  sequelize,
  sincronizarDB
};
