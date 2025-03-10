/**
 * Rutas principales de la aplicación
 */
const express = require('express');
const path = require('path');
const fs = require('fs');
const JavaScriptObfuscator = require('javascript-obfuscator');
const { verificarUsuario, disminuirUsosUsuario } = require('../controllers/usuarioController');
const { Acceso } = require('../models'); // Importar el modelo de Acceso
const router = express.Router();

// Ruta principal - muestra el emoji del zorro
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/fox.html'));
});

// Ruta para mostrar todos los usuarios
router.get('/usuarios', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/usuarios.html'));
});

// Ruta para mostrar el historial de accesos
router.get('/accesos', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/accesos.html'));
});

// Ruta específica para SIS101.js - con ofuscación y protección por base de datos
router.get('/SIS101.js', async (req, res) => {
  // Obtener credenciales
  const username = req.query.user;
  const password = req.query.pwd;
  
  // Variable para almacenar información sobre el usuario
  let usuario = null;
  
  // Obtener la dirección IP del cliente
  const ipAddress = req.headers['x-forwarded-for'] || 
                   req.connection.remoteAddress || 
                   req.socket.remoteAddress || 
                   req.connection.socket.remoteAddress || 
                   '0.0.0.0';
                   
  // Obtener la página de origen
  const pagina = req.headers.referer || 'Desconocida';
  
  // Si hay base de datos, verificar usuario
  if (username && password) {
    try {
      // Verificar credenciales en la base de datos
      const verificacion = await verificarUsuario(username, password);
      
      if (!verificacion.success) {
        // Registrar intento fallido de acceso
        if (verificacion.usuario) {
          try {
            await Acceso.create({
              userId: verificacion.usuario.id,
              username: username,
              ipAddress: ipAddress,
              pagina: pagina,
              fechaAcceso: new Date(),
              exito: false,
              mensaje: verificacion.message
            });
            console.log(`Acceso fallido registrado para ${username} desde ${ipAddress}`);
          } catch (errorLog) {
            console.error('Error al registrar acceso fallido:', errorLog);
          }
        }
        
        // Si el mensaje es específicamente sobre usos disponibles, mostrar mensaje personalizado
        if (verificacion.message === 'No quedan usos disponibles') {
          const mensajeError = `console.log("%c Ya no tienes créditos", "color: red; font-size: 20px; font-weight: bold;");`;
          res.type('application/javascript');
          return res.send(mensajeError);
        } else {
          return res.status(403).send(`Acceso denegado: ${verificacion.message}`);
        }
      } else {
        // Guardar información del usuario
        usuario = verificacion.usuario;
        
        // Registrar acceso exitoso
        try {
          await Acceso.create({
            userId: usuario.id,
            username: username,
            ipAddress: ipAddress,
            pagina: pagina,
            fechaAcceso: new Date(),
            exito: true
          });
          console.log(`Acceso exitoso registrado para ${username} desde ${ipAddress}`);
        } catch (errorLog) {
          console.error('Error al registrar acceso exitoso:', errorLog);
        }
        
        // Si la verificación es exitosa, continuar con el código
        console.log(`Usuario ${username} autenticado. Mensaje: ${verificacion.message}`);
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
  
  // Verificar si el usuario tiene exactamente 0 usos restantes (doble verificación)
  if (usuario && !usuario.esAdmin && usuario.usos === 0) {
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

    // Disminuir usos solo para usuarios no admin y que tengan ID
    if (usuario && !usuario.esAdmin && usuario.usos > 0) {
      try {
        // Ahora disminuimos los usos solo cuando sabemos que el usuario puede ejecutar el script
        await disminuirUsosUsuario(usuario.id);
        console.log(`Uso registrado para el usuario ${usuario.username}. Usos actualizados.`);
      } catch (error) {
        console.error('Error al disminuir usos:', error);
        // Continuamos aunque haya error, ya que la verificación ya se hizo
      }
    }

    // Ofuscar el código JavaScript
    const obfuscatedCode = JavaScriptObfuscator.obfuscate(data, {
      compact: true,
      controlFlowFlattening: true,
      controlFlowFlatteningThreshold: 0.5,
      deadCodeInjection: true,
      deadCodeInjectionThreshold: 0.3,
      debugProtection: false,
      disableConsoleOutput: false,
      identifierNamesGenerator: 'hexadecimal',
      log: false,
      renameGlobals: false,
      selfDefending: true,
      stringArray: true,
      stringArrayEncoding: ['base64'],
      stringArrayThreshold: 0.8,
      unicodeEscapeSequence: false
    }).getObfuscatedCode();

    // Añadir mensaje personalizado según el usuario
    let mensajeIntro = '';
    
    if (usuario) {
      if (usuario.esAdmin) {
        mensajeIntro = `console.log("%c ¡Bienvenido Administrador! Acceso ilimitado", "color: green; font-size: 16px; font-weight: bold;");\n\n`;
      } else {
        const usosRestantes = usuario.usos - 1; // Restar 1 al valor actual porque acabamos de consumir un uso
        if (usosRestantes <= 0) {
          mensajeIntro = `console.log("%c ¡Atención! Has consumido tu último crédito", "color: red; font-size: 16px; font-weight: bold;");\n\n`;
        } else if (usosRestantes === 1) {
          mensajeIntro = `console.log("%c ¡Atención! Este es tu último crédito disponible", "color: orange; font-size: 16px; font-weight: bold;");\n\n`;
        } else {
          mensajeIntro = `console.log("%c Acceso correcto. Te quedan ${usosRestantes} créditos", "color: blue; font-size: 16px;");\n\n`;
        }
      }
    } else {
      // Para acceso sin verificación (password 0000)
      mensajeIntro = `console.log("%c Acceso de emergencia concedido", "color: purple; font-size: 16px;");\n\n`;
    }

    // Enviar el código con el mensaje
    res.type('application/javascript');
    res.send(mensajeIntro + obfuscatedCode);
  });
});

module.exports = router;
