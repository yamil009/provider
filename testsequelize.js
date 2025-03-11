// Test de conexión usando Sequelize
const { Sequelize } = require('sequelize');

// Crear instancia de Sequelize con los mismos parámetros
const sequelize = new Sequelize(
  'user-control',  // DB_NAME
  'root',          // DB_USERNAME
  '74250853',      // DB_PASSWORD
  {
    host: '127.0.0.1',  // Usar IP en lugar de localhost
    port: 3306,
    dialect: 'mysql',
    logging: console.log,
    dialectOptions: {
      connectTimeout: 60000 // Aumentar timeout de conexión
    }
  }
);

// Probar la conexión
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Conexión con Sequelize establecida correctamente');
    return true;
  } catch (error) {
    console.error('Error al conectar con Sequelize:', error);
    return false;
  } finally {
    // Cerrar la conexión
    await sequelize.close();
  }
}

testConnection();
