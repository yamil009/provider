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

// RAILWAY: En Railway, conectamos directamente a MySQL usando las variables proporcionadas
if (isRailway) {
  console.log('Usando configuración de Railway para base de datos MySQL');
  
  // Usar exactamente los valores de las variables de entorno que vemos en Railway
  const DB_HOST = process.env.MYSQLHOST || 'mysql.railway.internal';
  const DB_PORT = process.env.MYSQLPORT || '3306';
  const DB_USER = process.env.MYSQLUSER || 'root';
  const DB_PASSWORD = process.env.MYSQLPASSWORD || process.env.MYSQL_ROOT_PASSWORD || '';
  const DB_NAME = process.env.MYSQLDATABASE || process.env.MYSQL_DATABASE || 'railway';
  
  // Mostrar configuración (sin la contraseña)
  console.log(`Conexión a MySQL:
  Host: ${DB_HOST}
  Puerto: ${DB_PORT}
  Usuario: ${DB_USER}
  Base de datos: ${DB_NAME}
  Password definida: ${!!DB_PASSWORD}`);
  
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
  // DESARROLLO LOCAL: Usar configuración del archivo .env
  const DB_NAME = process.env.DB_NAME || 'control_usuarios';
  const DB_USERNAME = process.env.DB_USER || 'root';
  const DB_PASSWORD = process.env.DB_PASSWORD || '';
  const DB_HOST = process.env.DB_HOST || '127.0.0.1';
  const DB_PORT = process.env.DB_PORT || 3306;
  
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
