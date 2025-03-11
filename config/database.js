/**
 * Configuración de la base de datos MySQL
 */
require('dotenv').config();
const { Sequelize } = require('sequelize');
const config = require('./config');

// Verificar entorno Railway
const isRailway = !!process.env.RAILWAY_SERVICE_NAME;
console.log(`¿Entorno Railway detectado? ${isRailway ? 'SÍ' : 'NO'}`);

// Mostrar todas las variables de entorno disponibles para debugging
if (isRailway) {
  console.log('VARIABLES DE ENTORNO DISPONIBLES EN RAILWAY:');
  console.log('RAILWAY_SERVICE_NAME:', process.env.RAILWAY_SERVICE_NAME);
  console.log('MYSQLHOST:', process.env.MYSQLHOST);
  console.log('RAILWAY_PRIVATE_DOMAIN:', process.env.RAILWAY_PRIVATE_DOMAIN);
  console.log('DB_HOST:', process.env.DB_HOST);
  console.log('MYSQLPORT:', process.env.MYSQLPORT);
  console.log('DB_PORT:', process.env.DB_PORT);
  console.log('MYSQLUSER:', process.env.MYSQLUSER);
  console.log('DB_USERNAME:', process.env.DB_USERNAME);
  console.log('MYSQLDATABASE:', process.env.MYSQLDATABASE);
  console.log('MYSQL_DATABASE:', process.env.MYSQL_DATABASE);
  console.log('MYSQL_URL:', process.env.MYSQL_URL);
}

// Determinar opciones de conexión
let sequelize;

// RAILWAY: Si estamos en Railway, usamos sus variables de entorno específicas
if (isRailway) {
  console.log('Usando configuración de Railway para base de datos MySQL');
  
  // En Railway, las variables vienen con nombres específicos
  // Priorizar las variables Railway nativas, luego las personalizadas
  const DB_HOST = process.env.MYSQLHOST || process.env.DB_HOST || process.env.RAILWAY_PRIVATE_DOMAIN || '127.0.0.1';
  const DB_PORT = process.env.MYSQLPORT || process.env.DB_PORT || '3306';
  const DB_USER = process.env.MYSQLUSER || process.env.DB_USERNAME || 'root';
  const DB_PASSWORD = process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || process.env.MYSQL_ROOT_PASSWORD;
  const DB_NAME = process.env.MYSQLDATABASE || process.env.MYSQL_DATABASE || 'railway';
  
  // Mostrar configuración (sin la contraseña)
  console.log(`Conexión Railway a MySQL:
  Host: ${DB_HOST}
  Puerto: ${DB_PORT}
  Usuario: ${DB_USER}
  Base de datos: ${DB_NAME}`);
  
  // Intentar usar MYSQL_URL directamente si está disponible
  if (process.env.MYSQL_URL && !process.env.MYSQL_URL.includes('${{')) {
    console.log('Usando MYSQL_URL directamente:', 
              process.env.MYSQL_URL.replace(/:[^:]*@/, ':****@')); // Ocultar contraseña en logs
    
    sequelize = new Sequelize(process.env.MYSQL_URL, {
      dialect: 'mysql',
      logging: false,
      define: {
        timestamps: false
      }
    });
  } else {
    // Crear instancia Sequelize con parámetros individuales
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
          timestamps: false
        },
        dialectOptions: {
          connectTimeout: 60000
        }
      }
    );
  }
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
        timestamps: false
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
