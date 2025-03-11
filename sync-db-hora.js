/**
 * Script para sincronizar la base de datos y añadir la nueva columna horaAcceso
 */
require('dotenv').config();
const { sequelize } = require('./config/database');
const Acceso = require('./models/Acceso');

async function sincronizarDB() {
  try {
    console.log('Iniciando sincronización de la base de datos...');
    
    // Verificar conexión
    await sequelize.authenticate();
    console.log('Conexión establecida correctamente.');
    
    // Sincronizar solo el modelo Acceso con alteración (añadir nuevas columnas)
    // El parámetro alter: true permite añadir nuevas columnas sin perder datos
    await Acceso.sync({ alter: true });
    console.log('Modelo Acceso sincronizado correctamente con la columna horaAcceso añadida.');
    
    // Comprobar si existe la columna horaAcceso
    const [results] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'accesos' 
      AND COLUMN_NAME = 'horaAcceso'
    `);
    
    if (results.length > 0) {
      console.log('✓ La columna horaAcceso existe en la tabla.');
      
      // Actualizar los registros existentes para tener una hora válida
      await sequelize.query(`
        UPDATE accesos
        SET horaAcceso = DATE_FORMAT(fechaAcceso, '%H:%i:%s')
        WHERE horaAcceso = '00:00:00' OR horaAcceso IS NULL
      `);
      console.log('✓ Registros existentes actualizados con la hora extraída de fechaAcceso.');
    } else {
      console.error('La columna horaAcceso no se añadió correctamente.');
    }
    
    console.log('Sincronización completada con éxito.');
    process.exit(0);
  } catch (error) {
    console.error('Error durante la sincronización:', error);
    process.exit(1);
  }
}

// Ejecutar la sincronización
sincronizarDB();
