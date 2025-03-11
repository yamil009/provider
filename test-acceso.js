/**
 * Script para probar la conexión a la tabla accesos y verificar su estructura
 */
const { sequelize, testConnection } = require('./config/database');
const Acceso = require('./models/Acceso');

// Función asíncrona para realizar las pruebas
async function testAccesoModel() {
  try {
    console.log('Intentando conectar a la base de datos MySQL...');
    
    // Probar la conexión a la base de datos
    const connected = await testConnection();
    console.log('Conexión a la base de datos:', connected ? 'EXITOSA' : 'FALLIDA');
    
    if (!connected) {
      throw new Error('No se pudo conectar a la base de datos');
    }
    
    // Verificar la estructura de la tabla accesos
    console.log('\nInformación de la tabla accesos:');
    try {
      const tableInfo = await sequelize.getQueryInterface().describeTable('accesos');
      console.log(JSON.stringify(tableInfo, null, 2));
    } catch (tableError) {
      console.error('Error al obtener información de la tabla accesos:', tableError.message);
      console.log('Intentando sincronizar el modelo con la base de datos...');
      
      try {
        // Intentar crear la tabla si no existe
        await Acceso.sync({ alter: true });
        console.log('Tabla accesos sincronizada correctamente');
        
        // Verificar nuevamente la estructura
        const tableInfoAfterSync = await sequelize.getQueryInterface().describeTable('accesos');
        console.log(JSON.stringify(tableInfoAfterSync, null, 2));
      } catch (syncError) {
        console.error('Error al sincronizar la tabla accesos:', syncError.message);
      }
    }
    
    // Intentar contar los registros en la tabla accesos
    try {
      const count = await Acceso.count();
      console.log(`\nLa tabla accesos tiene ${count} registros`);
    } catch (countError) {
      console.error('Error al contar registros en la tabla accesos:', countError.message);
    }
    
    // Cerrar la conexión
    await sequelize.close();
    console.log('\nPrueba completada');
    
  } catch (error) {
    console.error('Error general durante la prueba:', error.message);
    console.error('Stack trace:', error.stack);
    
    // Asegurar que la conexión se cierre incluso si hay un error
    try {
      await sequelize.close();
    } catch (closeError) {
      console.error('Error al cerrar la conexión:', closeError.message);
    }
  }
}

// Ejecutar las pruebas
testAccesoModel();
