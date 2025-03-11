/**
 * Configuración de la base de datos MySQL
 */
require('dotenv').config();
const { Sequelize } = require('sequelize');

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
    logging: false
  });
} else {
  // Para desarrollo local - Usando valores directos que sabemos que funcionan
  // IMPORTANTE: Este enfoque directo es temporal para solucionar el problema de conexión
  sequelize = new Sequelize(
    'user-control',     // Nombre de la base de datos
    'root',             // Usuario de MySQL
    '74250853',         // Contraseña
    {
      host: 'localhost',  // IP directa en lugar de localhost
      port: 3306,
      dialect: 'mysql',
      logging: console.log,  // Activar logging para ver más detalles
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
