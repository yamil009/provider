/**
 * Script para migrar la base de datos - Cambiar userAgent por pagina
 */
const { sequelize } = require('../config/database');
const { Acceso } = require('../models');

async function migrarAccesos() {
  const t = await sequelize.transaction();
  
  try {
    console.log('Iniciando migración de la tabla accesos...');
    
    // Verificar si la columna pagina ya existe
    console.log('Verificando si la columna pagina ya existe...');
    const [columnas] = await sequelize.query(
      "SELECT column_name FROM information_schema.columns WHERE table_name = 'accesos' AND column_name = 'pagina'"
    );
    
    // Si la columna no existe, crearla
    if (columnas.length === 0) {
      console.log('Creando columna pagina...');
      await sequelize.query(
        "ALTER TABLE accesos ADD COLUMN pagina VARCHAR(255) DEFAULT 'Desconocida'",
        { transaction: t }
      );
    } else {
      console.log('La columna pagina ya existe.');
    }
    
    // Asignar 'Desconocida' como valor predeterminado a todos los registros
    console.log('Asignando valores a la columna pagina...');
    await sequelize.query(
      "UPDATE accesos SET pagina = 'Desconocida' WHERE pagina IS NULL",
      { transaction: t }
    );
    
    // Verificar si la columna userAgent existe antes de intentar eliminarla
    const [columnaUserAgent] = await sequelize.query(
      "SELECT column_name FROM information_schema.columns WHERE table_name = 'accesos' AND column_name = 'userAgent'"
    );
    
    if (columnaUserAgent.length > 0) {
      console.log('Eliminando columna userAgent...');
      await sequelize.query(
        "ALTER TABLE accesos DROP COLUMN \"userAgent\"",
        { transaction: t }
      );
    } else {
      console.log('La columna userAgent ya no existe.');
    }
    
    await t.commit();
    console.log('Migración completada con éxito.');
    
    // Sincronizar el modelo con la base de datos
    await sequelize.sync({ alter: true });
    console.log('Modelo sincronizado con la base de datos.');
    
  } catch (error) {
    await t.rollback();
    console.error('Error durante la migración:', error);
  } finally {
    // Cerrar la conexión
    await sequelize.close();
  }
}

migrarAccesos();
