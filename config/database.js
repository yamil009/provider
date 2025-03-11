/**
 * Configuración de la base de datos MySQL
 */
require('dotenv').config();
const { Sequelize } = require('sequelize');
const config = require('./config');

// Verificar entorno Railway
const isRailway = !!process.env.RAILWAY_SERVICE_NAME;
console.log(`¿Entorno Railway detectado? ${isRailway ? 'SÍ' : 'NO'}`);

// Mostrar las variables críticas para debugging
if (isRailway) {
  console.log('Variables críticas para la conexión:');
  console.log('MYSQL_ROOT_PASSWORD definida:', !!process.env.MYSQL_ROOT_PASSWORD);
  console.log('MYSQLHOST:', process.env.MYSQLHOST);
  console.log('MYSQLPORT:', process.env.MYSQLPORT);
  console.log('MYSQLUSER:', process.env.MYSQLUSER);
  console.log('MYSQLDATABASE:', process.env.MYSQLDATABASE);
}

// Determinar opciones de conexión
let sequelize;

// RAILWAY: En Railway, conectamos directamente al servicio MySQL vinculado
if (isRailway) {
  console.log('Usando configuración de Railway para base de datos MySQL');
  
  // Usar "mysql" como host interno en Railway cuando está vinculado
  const DB_HOST = 'mysql';  // Nombre del servicio MySQL vinculado en Railway
  const DB_PORT = '3306';
  const DB_USER = 'root';
  const DB_PASSWORD = process.env.MYSQL_ROOT_PASSWORD;
  const DB_NAME = 'railway';
  
  // Mostrar configuración (sin la contraseña)
  console.log(`Conexión Railway a MySQL (interna):
  Host: ${DB_HOST}
  Puerto: ${DB_PORT}
  Usuario: ${DB_USER}
  Base de datos: ${DB_NAME}`);
  
  // Crear instancia Sequelize con parámetros para Railway
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
        timestamps: false // Respetar estructura personalizada sin timestamps automáticos
      },
      dialectOptions: {
        connectTimeout: 60000
      }
    }
  );
} else {
  // DESARROLLO LOCAL: Usar configuración hardcodeada para desarrollo
  const DB_NAME = 'user-control';
  const DB_USERNAME = 'root';
  const DB_PASSWORD = '74250853';
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
        timestamps: false // Respetar estructura personalizada sin timestamps
      },
      dialectOptions: {
        connectTimeout: 60000
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
