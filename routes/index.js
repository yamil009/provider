/**
 * Rutas principales de la aplicación
 */
const express = require('express');
const path = require('path');
const fs = require('fs');
const JavaScriptObfuscator = require('javascript-obfuscator');
const { verificarUsuario, disminuirUsosUsuario } = require('../controllers/usuarioController');
const router = express.Router();

// Ruta principal - muestra el emoji del zorro
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/fox.html'));
});

// Ruta para mostrar todos los usuarios
router.get('/usuarios', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/usuarios.html'));
});

// Ruta específica para SIS101.js - con ofuscación y protección por base de datos
router.get('/SIS101.js', async (req, res) => {
  // Obtener credenciales
  const username = req.query.user;
  const password = req.query.pwd;
  
  // Variable para almacenar información sobre el usuario
  let usosRestantes = null;
  let esAdmin = false;
  let userId = null;
  
  // Si hay base de datos, verificar usuario
  if (username && password) {
    try {
      // Verificar credenciales en la base de datos
      const verificacion = await verificarUsuario(username, password);
      
      if (!verificacion.success) {
        return res.status(403).send(`Acceso denegado: ${verificacion.message}`);
      } else {
        // Guardar información para decidir qué mensaje mostrar
        usosRestantes = verificacion.usosRestantes;
        esAdmin = verificacion.esAdmin;
        userId = verificacion.userId;
        
        // Si la verificación es exitosa, continuar con el código
        console.log(`Usuario ${username} autenticado. Usos restantes: ${verificacion.usosRestantes}`);
      }
    } catch (error) {
      console.error('Error al verificar usuario:', error);
      
      // Si hay error en la verificación, usar el método antiguo de contraseña fija
      if (!password || password !== '0000') {
        return res.status(403).send('Acceso denegado. Se requiere contraseña válida.');
      }
    }
  } else {
    // Método antiguo con contraseña fija como fallback
    if (!password || password !== '0000') {
      return res.status(403).send('Acceso denegado. Se requiere contraseña válida.');
    }
  }
  
  // Verificar si el usuario tiene exactamente 0 usos restantes
  if (usosRestantes === 0) {
    const mensajeError = `console.log("%c Ya no tienes créditos", "color: red; font-size: 20px; font-weight: bold;");`;
    res.type('application/javascript');
    return res.send(mensajeError);
  }
  
  // Si la contraseña es correcta y el usuario tiene créditos, leer el contenido del archivo original
  const filePath = path.join(__dirname, '../SIS101.js');
  
  fs.readFile(filePath, 'utf8', async (err, data) => {
    if (err) {
      return res.status(500).send('Error al leer el archivo');
    }

    // Disminuir usos solo para usuarios no admin y que tengan ID (es decir, que no sean el admin "yamil")
    if (userId && !esAdmin && usosRestantes > 0) {
      try {
        // Ahora disminuimos los usos solo cuando sabemos que el usuario puede ejecutar el script
        await disminuirUsosUsuario(userId);
        console.log(`Uso registrado para el usuario ${username}. Usos restantes actualizados.`);
      } catch (error) {
        console.error('Error al disminuir usos:', error);
        // Continuamos aunque haya error, ya que la verificación ya se hizo
      }
    }

    // Ofuscar el código JavaScript
    const obfuscatedCode = JavaScriptObfuscator.obfuscate(data, {
      compact: true,
      controlFlowFlattening: true,
      controlFlowFlatteningThreshold: 0.75,
      deadCodeInjection: true,
      deadCodeInjectionThreshold: 0.4,
      debugProtection: false,
      debugProtectionInterval: 0,
      disableConsoleOutput: false,
      identifierNamesGenerator: 'hexadecimal',
      log: false,
      renameGlobals: true,
      rotateStringArray: true,
      selfDefending: true,
      stringArray: true,
      stringArrayEncoding: ['base64'],
      stringArrayThreshold: 0.75,
      transformObjectKeys: true,
      unicodeEscapeSequence: true
    }).getObfuscatedCode();

    // Añadir mensaje de consola al inicio del código con el nombre del usuario
    const nombreUsuario = username || 'Invitado';
    const codeWithMessage = `console.log("%c Capitulo aprobado Usuario: ${nombreUsuario}", "color: green; font-size: 20px; font-weight: bold;");\n${obfuscatedCode}`;

    // Establecer el tipo de contenido y enviar el código ofuscado con el mensaje
    res.type('application/javascript');
    res.send(codeWithMessage);
  });
});

module.exports = router;
