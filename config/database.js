/**
 * Configuración de la base de datos PostgreSQL
 */
require('dotenv').config();
const { Sequelize } = require('sequelize');

// Determinar si usar la URL de la base de datos (producción) o configuración individual (desarrollo)
const useConnectionString = process.env.DATABASE_URL ? true : false;

// Crear instancia de Sequelize
let sequelize;

if (useConnectionString) {
  // Para producción (Render proporciona DATABASE_URL)
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false // Necesario para Render
      }
    },
    logging: false
  });
} else {
  // Para desarrollo local
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USERNAME,
    process.env.DB_PASSWORD, 
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      dialect: process.env.DB_DIALECT || 'postgres',
      logging: false
    }
  );
}

// Función para probar la conexión
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexión a la base de datos establecida correctamente.');
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
