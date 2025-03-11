/**
 * Configuración de la base de datos MySQL
 */
require('dotenv').config();
const { Sequelize } = require('sequelize');
const config = require('./config');

// Verificar entorno Railway - sus variables tienen formatos específicos
const isRailway = !!process.env.RAILWAY_SERVICE_NAME;

// Para Railway, usamos MYSQL_URL o construimos la URL con las variables individuales
let connectionString = null;

if (isRailway) {
  if (process.env.MYSQL_URL) {
    connectionString = process.env.MYSQL_URL;
  } else if (process.env.MYSQLHOST) {
    // Construir URL de conexión a partir de variables de entorno de Railway
    connectionString = `mysql://${process.env.MYSQLUSER}:${process.env.MYSQLPASSWORD}@${process.env.MYSQLHOST}:${process.env.MYSQLPORT}/${process.env.MYSQLDATABASE}`;
  }
}

// Si no estamos en Railway, buscar DATABASE_URL normal
if (!connectionString && process.env.DATABASE_URL) {
  connectionString = process.env.DATABASE_URL;
}

// Crear instancia de Sequelize
let sequelize;

if (connectionString) {
  // Para producción (Railway)
  console.log(`Usando URL de conexión en entorno: ${isRailway ? 'Railway' : 'Producción'}`);
  
  sequelize = new Sequelize(connectionString, {
    dialect: 'mysql',
    dialectOptions: {
      ssl: process.env.DB_SSL === 'true' ? {
        require: true,
        rejectUnauthorized: false
      } : false
    },
    logging: false,
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
