/**
 * Script para sincronizar la tabla de usuarios
 * - Elimina las columnas createdAt y updatedAt
 * - Añade las nuevas columnas fechaCreacion y horaCreacion
 */
require('dotenv').config();
const { sequelize } = require('./config/database');
const User = require('./models/User');

async function sincronizarUsuarios() {
  try {
    console.log('Iniciando sincronización de la tabla usuarios...');
    
    // Verificar conexión
    await sequelize.authenticate();
    console.log('Conexión establecida correctamente.');
    
    // Primero necesitamos añadir las nuevas columnas
    try {
      // Añadir columna fechaCreacion
      await sequelize.query(`ALTER TABLE usuarios ADD COLUMN fechaCreacion DATE`);
      console.log('Columna fechaCreacion añadida.');
    } catch (err) {
      console.log('La columna fechaCreacion ya existe o no se pudo crear:', err.message);
    }

    try {
      // Añadir columna horaCreacion
      await sequelize.query(`ALTER TABLE usuarios ADD COLUMN horaCreacion VARCHAR(8)`);
      console.log('Columna horaCreacion añadida.');
    } catch (err) {
      console.log('La columna horaCreacion ya existe o no se pudo crear:', err.message);
    }
    
    // Migrar datos de createdAt a las nuevas columnas
    try {
      // Verificamos si existen las columnas createdAt y las nuevas columnas
      const [columnas] = await sequelize.query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'usuarios' 
        AND COLUMN_NAME IN ('createdAt', 'fechaCreacion', 'horaCreacion')
      `);
      
      const columnaNames = columnas.map(c => c.COLUMN_NAME);
      
      if (columnaNames.includes('createdAt') && 
          columnaNames.includes('fechaCreacion') && 
          columnaNames.includes('horaCreacion')) {
        console.log('Migrando datos de createdAt a las nuevas columnas...');
        
        // Actualizar fechaCreacion
        await sequelize.query(`
          UPDATE usuarios
          SET fechaCreacion = DATE(createdAt)
        `);
        console.log('Datos migrados a fechaCreacion.');
        
        // Actualizar horaCreacion
        await sequelize.query(`
          UPDATE usuarios
          SET horaCreacion = TIME_FORMAT(createdAt, '%H:%i:%s')
        `);
        console.log('Datos migrados a horaCreacion.');
      } else {
        console.log('No es posible migrar datos. No todas las columnas necesarias existen.');
        
        // Si no existe createdAt pero existen las nuevas columnas, inicializarlas con valores por defecto
        if (!columnaNames.includes('createdAt') && 
            columnaNames.includes('fechaCreacion') && 
            columnaNames.includes('horaCreacion')) {
          console.log('Inicializando las nuevas columnas con valores por defecto...');
          
          await sequelize.query(`
            UPDATE usuarios
            SET fechaCreacion = CURRENT_DATE,
                horaCreacion = CURRENT_TIME
            WHERE fechaCreacion IS NULL OR horaCreacion IS NULL
          `);
          console.log('Columnas inicializadas con valores por defecto.');
        }
      }
    } catch (err) {
      console.log('Error al migrar datos:', err.message);
    }
    
    // Actualizar columnas para que tengan valores NO NULL
    try {
      // Asegurarnos de que fechaCreacion sea NOT NULL y tenga un valor por defecto
      await sequelize.query(`
        ALTER TABLE usuarios 
        MODIFY fechaCreacion DATE NOT NULL DEFAULT (CURRENT_DATE)
      `);
      console.log('Columna fechaCreacion modificada a NOT NULL.');
    } catch (err) {
      console.log('Error al modificar fechaCreacion:', err.message);
    }
    
    try {
      // Asegurarnos de que horaCreacion sea NOT NULL y tenga un valor por defecto
      await sequelize.query(`
        ALTER TABLE usuarios 
        MODIFY horaCreacion VARCHAR(8) NOT NULL DEFAULT '00:00:00'
      `);
      console.log('Columna horaCreacion modificada a NOT NULL.');
    } catch (err) {
      console.log('Error al modificar horaCreacion:', err.message);
    }
    
    // Ahora eliminar las columnas antiguas si existen
    try {
      const [columnas] = await sequelize.query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'usuarios' 
        AND COLUMN_NAME IN ('createdAt', 'updatedAt')
      `);
      
      for (const col of columnas) {
        await sequelize.query(`ALTER TABLE usuarios DROP COLUMN ${col.COLUMN_NAME}`);
        console.log(`Columna ${col.COLUMN_NAME} eliminada.`);
      }
    } catch (err) {
      console.log('Error al eliminar columnas antiguas:', err.message);
    }
    
    // Verificar estructura final
    console.log('Verificando estructura final de la tabla...');
    const [columnasFinales] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'usuarios'
      ORDER BY ORDINAL_POSITION
    `);
    
    console.log('Estructura final de la tabla usuarios:');
    columnasFinales.forEach(col => {
      console.log(`- ${col.COLUMN_NAME}`);
    });
    
    console.log('Sincronización de la tabla usuarios completada con éxito.');
    process.exit(0);
  } catch (error) {
    console.error('Error durante la sincronización:', error);
    process.exit(1);
  }
}

// Ejecutar la sincronización
sincronizarUsuarios();
