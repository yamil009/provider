/**
 * Script para sincronizar el modelo Acceso con la base de datos
 */
const { sequelize } = require('./config/database');
const Acceso = require('./models/Acceso');

async function sincronizarModelo() {
  try {
    console.log('Iniciando sincronización del modelo Acceso...');
    
    // Sincronizar el modelo Acceso (alter:true permite modificar la tabla existente)
    await Acceso.sync({ alter: true });
    
    console.log('Sincronización completada con éxito.');
    
    // Verificar estructura actualizada
    console.log('\nVerificando estructura actualizada de la tabla:');
    const tableInfo = await sequelize.getQueryInterface().describeTable('accesos');
    console.log(JSON.stringify(tableInfo, null, 2));
    
    await sequelize.close();
  } catch (error) {
    console.error('Error durante la sincronización:', error.message);
    console.error('Stack trace:', error.stack);
    
    try {
      await sequelize.close();
    } catch (closeError) {
      console.error('Error al cerrar la conexión:', closeError.message);
    }
  }
}

sincronizarModelo();
