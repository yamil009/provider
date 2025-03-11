/**
 * Script para crear un usuario desde la línea de comandos
 * Uso: node create-user.js username password totalUsos
 */
const bcrypt = require('bcrypt');
const { Pool } = require('pg');
require('dotenv').config();

// Leer argumentos
const username = process.argv[2];
const password = process.argv[3];
const totalUsos = parseInt(process.argv[4] || '5');

if (!username || !password) {
  console.error('Uso: node create-user.js username password [totalUsos]');
  process.exit(1);
}

// Configurar conexión a PostgreSQL
const pool = new Pool({
  user: process.env.DB_USERNAME,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function createUser() {
  try {
    // Generar hash de la contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    // Insertar usuario
    const result = await pool.query(
      `INSERT INTO usuarios (
        username, 
        password, 
        "totalUsos", 
        "usosRestantes", 
        activo, 
        "createdAt", 
        "updatedAt"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [username, passwordHash, totalUsos, totalUsos, true, new Date(), new Date()]
    );
    
    console.log(`Usuario creado con ID: ${result.rows[0].id}`);
    console.log(`Username: ${username}`);
    console.log(`Total de usos: ${totalUsos}`);
    console.log(`Password: ${password} (hasheada en la base de datos)`);
  } catch (error) {
    console.error('Error al crear usuario:', error);
  } finally {
    pool.end();
  }
}

createUser();
