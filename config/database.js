/**
 * Configuración de la base de datos MySQL
 */
require('dotenv').config();
const { Sequelize } = require('sequelize');
const config = require('./config');

// Determinar si usar la URL de la base de datos (producción) o configuración individual (desarrollo)
// En Railway, utilizamos la variable MYSQL_URL que nos proporciona
const useConnectionString = process.env.MYSQL_URL || process.env.DATABASE_URL ? true : false;

// Crear instancia de Sequelize
let sequelize;

if (useConnectionString) {
  // Para producción (Railway proporciona MYSQL_URL)
  const connectionString = process.env.MYSQL_URL || process.env.DATABASE_URL;
  console.log(`Usando URL de conexión: ${connectionString ? 'Sí (no mostrada por seguridad)' : 'No'}`);
  
  sequelize = new Sequelize(connectionString, {
    dialect: 'mysql',
    dialectOptions: {
      ssl: process.env.DB_SSL === 'true' ? {
        require: true,
        rejectUnauthorized: false
      } : false
    },
    logging: config.database.logging,
    define: {
      timestamps: false // Desactivamos timestamps para evitar createdAt/updatedAt
    }
  });
} else {
  // Para desarrollo local - usando los valores específicos para tu entorno
  // Hardcodeamos la contraseña de MySQL para entorno local para asegurar la conexión
  const DB_NAME = 'user-control';
  const DB_USERNAME = 'root';
  const DB_PASSWORD = '74250853'; // Tu contraseña hardcodeada
  const DB_HOST = '127.0.0.1';
  const DB_PORT = 3306;
  
  console.log(`Conexión local a MySQL:
  Host: ${DB_HOST}
  Puerto: ${DB_PORT}
  Usuario: ${DB_USERNAME}
  Base de datos: ${DB_NAME}`);
  
  sequelize = new Sequelize(
    DB_NAME,
    DB_USERNAME,
    DB_PASSWORD,
    {
      host: DB_HOST,
      port: DB_PORT,
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
