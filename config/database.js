/**
 * Configuración de la base de datos MySQL
 */
require('dotenv').config();
const { Sequelize } = require('sequelize');
const config = require('./config');

// Determinar si usar la URL de la base de datos (producción) o configuración individual (desarrollo)
const useConnectionString = process.env.DATABASE_URL ? true : false;

// Crear instancia de Sequelize
let sequelize;

if (useConnectionString) {
  // Para producción (Railway proporciona DATABASE_URL)
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'mysql',
    dialectOptions: {
      ssl: process.env.DB_SSL === 'true' ? {
        require: true,
        rejectUnauthorized: false
      } : false
    },
    logging: config.database.logging
  });
} else {
  // Para desarrollo local - usando los valores específicos para tu entorno
  // Nota: Valores hardcodeados como fallback si las variables de entorno no funcionan
  sequelize = new Sequelize(
    process.env.DB_NAME || 'user-control',
    process.env.DB_USERNAME || 'root',
    process.env.DB_PASSWORD || '74250853',
    {
      host: process.env.DB_HOST || '127.0.0.1',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      dialect: 'mysql',
      logging: console.log,
      timezone: '-04:00',
      define: {
        timestamps: false // Desactivamos timestamps por defecto
      },
      dialectOptions: {
        connectTimeout: 60000 // Aumentar timeout de conexión
      }
    }
  );
}

// Función para probar la conexión
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexión a la base de datos MySQL establecida correctamente.');
    return true;
  } catch (error) {
    console.error('Error al conectar con la base de datos:', error);
    return false;
  }
};

module.exports = {
  sequelize,
  testConnection
};
