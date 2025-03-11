// Test simple de conexión a MySQL
const mysql = require('mysql2');

// Crear conexión (sin especificar base de datos)
const connection = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: '74250853',
  connectTimeout: 60000
});

// Probar la conexión básica
connection.connect(function(err) {
  if (err) {
    console.error('Error conectando a MySQL:', err);
    return;
  }
  
  console.log('¡Conexión a MySQL exitosa!');
  
  // Verificar si la base de datos existe
  connection.query("SHOW DATABASES LIKE 'user-control'", function (err, results) {
    if (err) {
      console.error('Error al buscar la base de datos:', err);
      connection.end();
      return;
    }
    
    if (results.length === 0) {
      console.log("La base de datos 'user-control' NO existe, se creará ahora...");
      connection.query("CREATE DATABASE `user-control`", function(err) {
        if (err) {
          console.error('Error al crear la base de datos:', err);
        } else {
          console.log("Base de datos 'user-control' creada exitosamente");
        }
        connection.end();
      });
    } else {
      console.log("La base de datos 'user-control' ya existe");
      connection.end();
    }
  });
});
