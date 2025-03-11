/**
 * Configuración de la base de datos MySQL
 */
require('dotenv').config();
const { Sequelize } = require('sequelize');
const config = require('./config');

// Verificar entorno Railway
const isRailway = !!process.env.RAILWAY_SERVICE_NAME;
console.log(`¿Entorno Railway detectado? ${isRailway ? 'SÍ' : 'NO'}`);

// Determinar opciones de conexión
let sequelize;

// RAILWAY: Si estamos en Railway, usamos sus variables de entorno específicas
if (isRailway) {
  console.log('Usando configuración de Railway para base de datos MySQL');
  
  // Railway proporciona variables específicas
  const DB_HOST = process.env.MYSQLHOST || process.env.DB_HOST;
  const DB_PORT = process.env.MYSQLPORT || process.env.DB_PORT;
  const DB_USER = process.env.MYSQLUSER || process.env.DB_USER;
  const DB_PASSWORD = process.env.MYSQLPASSWORD || process.env.DB_PASSWORD;
  const DB_NAME = process.env.MYSQLDATABASE || process.env.DB_NAME;
  
  // Mostrar configuración (sin la contraseña)
  console.log(`Conexión Railway a MySQL:
  Host: ${DB_HOST}
  Puerto: ${DB_PORT}
  Usuario: ${DB_USER}
  Base de datos: ${DB_NAME}`);
  
  // Crear instancia Sequelize para Railway
  sequelize = new Sequelize(
    DB_NAME,
    DB_USER,
    DB_PASSWORD,
    {
      host: DB_HOST,
      port: DB_PORT,
      dialect: 'mysql',
      logging: false,
      timezone: '-04:00',
      define: {
        timestamps: false // Desactivamos timestamps por defecto
      },
      dialectOptions: {
        connectTimeout: 60000 // Aumentar timeout de conexión
      }
    }
  );
} else {
  // DESARROLLO LOCAL: Usar configuración hardcodeada para desarrollo
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
