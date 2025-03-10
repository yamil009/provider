/**
 * Script para eliminar y recrear la base de datos con la estructura correcta
 * Script en español para recrear la base de datos del sistema de proveedores
 */
require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');
const { Client } = require('pg');
const bcrypt = require('bcrypt');

async function recrearBaseDatos() {
  try {
    console.log('Iniciando proceso de recreación de la base de datos...');
    
    // 1. Conectar a PostgreSQL para eliminar y recrear la base de datos
    const client = new Client({
      user: process.env.DB_USERNAME,
      host: process.env.DB_HOST,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT,
      database: 'postgres' // Base de datos por defecto para administración
    });

    // Obtener nombre de base de datos
    const dbName = process.env.DB_NAME;
    // Escapar el nombre de la base de datos con comillas dobles para manejar guiones y palabras reservadas
    const dbNameEscaped = `"${dbName}"`;

    console.log('Conectando a PostgreSQL...');
    await client.connect();
    
    // 2. Cerrar conexiones existentes a la base de datos
    console.log(`Cerrando conexiones a la base de datos ${dbName}...`);
    await client.query(`
      SELECT pg_terminate_backend(pg_stat_activity.pid)
      FROM pg_stat_activity
      WHERE pg_stat_activity.datname = '${dbName}'
      AND pid <> pg_backend_pid();
    `);
    
    // 3. Eliminar la base de datos si existe
    console.log(`Eliminando base de datos ${dbName} si existe...`);
    await client.query(`DROP DATABASE IF EXISTS ${dbNameEscaped};`);
    
    // 4. Recrear la base de datos
    console.log(`Creando base de datos ${dbName}...`);
    await client.query(`CREATE DATABASE ${dbNameEscaped};`);
    
    console.log('Base de datos recreada correctamente.');
    await client.end();
    
    // 5. Ahora vamos a crear las tablas usando Sequelize
    console.log('Conectando a la nueva base de datos para crear las tablas...');
    const sequelize = new Sequelize(
      dbName,
      process.env.DB_USERNAME,
      process.env.DB_PASSWORD,
      {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: process.env.DB_DIALECT || 'postgres',
        logging: console.log // Habilitamos logging para ver las consultas SQL
      }
    );

    // Comprobar conexión a la nueva base de datos
    await sequelize.authenticate();
    console.log('Conexión establecida a la nueva base de datos.');
    
    // Definir el modelo User directamente en este script para asegurar que se crea correctamente
    console.log('Definiendo modelo de Usuario...');
    const User = sequelize.define('User', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false
      },
      usos: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 5
      },
      activo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      esAdmin: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      }
    }, {
      tableName: 'usuarios', // Nombre de la tabla en español
      timestamps: true // Añadir createdAt y updatedAt
    });
    
    // Sincronizar el modelo con la base de datos (crear tablas)
    console.log('Creando tablas en la base de datos...');
    await sequelize.sync({ force: true });
    console.log('Tablas creadas correctamente.');
    
    // Crear el usuario administrador
    console.log('Creando usuario administrador "yamil"...');
    // Hashear la contraseña manualmente
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('0000', salt);
    
    // Insertar el usuario admin directamente
    await User.create({
      username: 'yamil',
      password: hashedPassword,
      usos: 999999,
      activo: true,
      esAdmin: true
    });
    
    console.log('¡Proceso completado con éxito!');
    console.log('Ahora puedes iniciar el servidor con: node server.js');
    
    // Cerrar la conexión de sequelize
    await sequelize.close();
    
    process.exit(0);
  } catch (error) {
    console.error('Error durante el proceso de recreación de la base de datos:', error);
    process.exit(1);
  }
}

// Ejecutar la función
recrearBaseDatos();
