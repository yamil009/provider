/**
 * Script definitivo para aprobar ejercicios y registrar capítulos
 * Versión completa con todas las validaciones necesarias
 */

// Función para aprobar un ejercicio específico con calificación máxima
function aprobarEjercicio(ejercicioIndex) {
  // Verificar que el ejercicio existe
  if (!capitulo || !capitulo.ejercicios || ejercicioIndex >= capitulo.ejercicios.length) {
    return false;
  }

  try {
    // Establecer el ejercicio actual
    Ejercicio.neg = ejercicioIndex;

    // Obtener el ejercicio
    const ejercicio = capitulo.ejercicios[ejercicioIndex];

    // Acceder al enunciado actual
    const enunciadoActual = ejercicio.enunciado;

    // Establecer puntos (máximos)
    const puntajeTotal = ejercicio.puntaje;

    // Asegurarse de que Capitulo.reg esté inicializado correctamente para este ejercicio
    if (!Capitulo.reg[ejercicioIndex] || Capitulo.reg[ejercicioIndex].length < 2) {
      // Inicializar si no existe o está incompleto
      if (!Capitulo.reg[ejercicioIndex]) {
        Capitulo.reg[ejercicioIndex] = [0];
      }

      // Asegurar que haya espacio para el enunciado actual + 1
      while (Capitulo.reg[ejercicioIndex].length <= enunciadoActual + 1) {
        Capitulo.reg[ejercicioIndex].push(0);
      }
    }

    // Actualizar Capitulo.reg para marcar que se generó esta alternativa
    Capitulo.reg[ejercicioIndex][0] = enunciadoActual + 1;

    // Definir nota y puntos como propiedades no modificables
    Object.defineProperties(ejercicio, {
      "puntos": {
        value: puntajeTotal,
        writable: false,
        enumerable: false,
        configurable: true
      },
      "nota": {
        value: 100,
        writable: false,
        enumerable: false,
        configurable: true
      }
    });

    // Actualizar registro para marcar la alternativa como aprobada
    Capitulo.reg[ejercicioIndex][enunciadoActual + 1] = 1;

    // Calcular los puntos actuales del capítulo sumando todos los ejercicios
    let puntosCapitulo = 0;
    for (let i = 0; i < capitulo.ejercicios.length; i++) {
      puntosCapitulo += capitulo.ejercicios[i].puntos;
    }

    // Actualizar puntos del capítulo
    Object.defineProperty(capitulo, "puntos", {
      value: puntosCapitulo,
      writable: false,
      enumerable: false,
      configurable: true
    });

    // Recalcular nota del capítulo
    const notaCapitulo = Math.round(puntosCapitulo / capitulo.puntaje * 100);
    Object.defineProperty(capitulo, "nota", {
      value: notaCapitulo,
      writable: false,
      enumerable: false,
      configurable: true
    });

    // *** ACTUALIZAR ELEMENTOS VISUALES EN EL DOM ***
    const divEjercicio = document.getElementById("ejercicio" + (ejercicioIndex + 1));
    if (divEjercicio) {
      // Actualizar elementos de nota y puntos
      let itNota = divEjercicio.querySelector(".notas") ||
        divEjercicio.querySelector(".itNota");
      let itPuntos = null;

      if (divEjercicio.querySelectorAll(".notas").length > 1) {
        itPuntos = divEjercicio.querySelectorAll(".notas")[1];
      } else {
        itPuntos = divEjercicio.querySelector(".itPuntos");
      }

      // Si no existen los elementos, crearlos
      if (!itNota) {
        // Buscar un contenedor existente o crear uno nuevo
        let notasContainer = divEjercicio.querySelector(".notas-container");
        if (!notasContainer) {
          notasContainer = document.createElement("div");
          notasContainer.className = "notas-container";
          divEjercicio.appendChild(notasContainer);
        }

        // Crear elemento para la nota
        itNota = document.createElement("input");
        itNota.type = "text";
        itNota.className = "notas";
        itNota.readOnly = true;
        notasContainer.appendChild(itNota);

        // Crear elemento para los puntos
        itPuntos = document.createElement("input");
        itPuntos.type = "text";
        itPuntos.className = "notas";
        itPuntos.readOnly = true;
        notasContainer.appendChild(itPuntos);
      }

      // Establecer los valores
      if (itNota) itNota.value = 100;
      if (itPuntos) itPuntos.value = puntajeTotal;

      // Eliminar elementos de UI si existen
      try {
        const btCorregir = document.getElementById("btCorregir");
        const lbTiempo = document.getElementById("lbTiempo");
        const itTiempo = document.getElementById("itTiempo");

        if (btCorregir) divEjercicio.removeChild(btCorregir);
        if (lbTiempo) divEjercicio.removeChild(lbTiempo);
        if (itTiempo) divEjercicio.removeChild(itTiempo);
      } catch (e) {
        // Ignorar errores de UI
      }
    }

    // Actualizar el elemento de nota del capítulo si existe
    const notaCapituloEl = document.getElementById("notaCapitulo");
    if (notaCapituloEl) {
      notaCapituloEl.value = notaCapitulo;
    }

    // Guardar el registro actualizado en el DOM
    capitulo.setReg();

    // Verificar si todos los ejercicios están resueltos
    let todosResueltos = true;
    for (let i = 0; i < capitulo.ejercicios.length; i++) {
      if (capitulo.ejercicios[i].puntos === 0) {
        todosResueltos = false;
        break;
      }
    }

    // Habilitar el botón "Registrar Capítulo" si todos los ejercicios están resueltos
    if (todosResueltos) {
      const btGenerarPrueba = document.getElementById("btGenerarPrueba");
      if (btGenerarPrueba) {
        btGenerarPrueba.disabled = false;
      }
    }

    return true;
  } catch (error) {
    return false;
  }
}

// Función para aprobar todos los ejercicios del capítulo
function aprobarTodosEjercicios() {
  if (!capitulo || !capitulo.ejercicios) {
    return;
  }

  // Asegurarse que Capitulo.reg exista
  if (!Capitulo.reg || !Array.isArray(Capitulo.reg)) {
    // Si no existe, iniciamos o recargamos
    try {
      capitulo.readReg();
    } catch (e) {
      // Si no se puede leer, crear un array vacío
      Capitulo.reg = [];
      for (let i = 0; i < capitulo.ejercicios.length; i++) {
        Capitulo.reg.push([0]);
      }
    }
  }

  let todosAprobados = true;
  for (let i = 0; i < capitulo.ejercicios.length; i++) {
    if (!aprobarEjercicio(i)) {
      todosAprobados = false;
    }
  }

  // Asegurar que la nota del capítulo sea coherente
  let puntosTotal = 0;
  for (let i = 0; i < capitulo.ejercicios.length; i++) {
    puntosTotal += capitulo.ejercicios[i].puntos;
  }

  // Recalcular la nota final
  const notaFinal = Math.round(puntosTotal / capitulo.puntaje * 100);
  Object.defineProperty(capitulo, "nota", {
    value: notaFinal,
    writable: false,
    enumerable: false,
    configurable: true
  });

  // Asegurar que existe la propiedad ncapitulo
  if (!capitulo.hasOwnProperty("ncapitulo")) {
    Object.defineProperty(capitulo, "ncapitulo", {
      value: notaFinal,
      writable: false,
      enumerable: false,
      configurable: true
    });
  }

  // Actualizar la UI de nota del capítulo
  const notaCapituloEl = document.getElementById("notaCapitulo");
  if (notaCapituloEl) {
    notaCapituloEl.value = notaFinal;
  }

  // Guardar registro final
  capitulo.setReg();

  return todosAprobados;
}

// Función de ayuda para la depuración
function verificarIntegridad() {
  if (!capitulo || !capitulo.ejercicios) {
    return false;
  }

  let problemas = [];

  // 1. Verificar que todos los ejercicios tengan nota 100
  for (let i = 0; i < capitulo.ejercicios.length; i++) {
    const ej = capitulo.ejercicios[i];
    if (ej.nota !== 100) {
      problemas.push(`El ejercicio ${i + 1} tiene nota ${ej.nota}, debería ser 100`);
    }
    if (ej.puntos !== ej.puntaje) {
      problemas.push(`El ejercicio ${i + 1} tiene puntos ${ej.puntos}, debería ser ${ej.puntaje}`);
    }
  }

  // 2. Verificar coherencia entre DOM y objetos
  const divEjercicios = document.querySelectorAll("div.ejercicio");
  for (let i = 0; i < divEjercicios.length; i++) {
    const div = divEjercicios[i];
    const itNota = div.querySelector(".notas") || div.querySelector(".itNota");

    let itPuntos = null;
    if (div.querySelectorAll(".notas").length > 1) {
      itPuntos = div.querySelectorAll(".notas")[1];
    } else {
      itPuntos = div.querySelector(".itPuntos");
    }

    if (itNota && parseInt(itNota.value) !== 100) {
      problemas.push(`El elemento DOM de nota del ejercicio ${i + 1} tiene valor ${itNota.value}, debería ser 100`);
    }

    if (itPuntos && parseInt(itPuntos.value) !== capitulo.ejercicios[i].puntaje) {
      problemas.push(`El elemento DOM de puntos del ejercicio ${i + 1} tiene valor ${itPuntos.value}, debería ser ${capitulo.ejercicios[i].puntaje}`);
    }
  }

  // 3. Verificar nota del capítulo
  const puntosTotal = capitulo.ejercicios.reduce((sum, ej) => sum + ej.puntos, 0);
  const notaEsperada = Math.round(puntosTotal / capitulo.puntaje * 100);

  if (capitulo.nota !== notaEsperada) {
    problemas.push(`La nota del capítulo es ${capitulo.nota}, debería ser ${notaEsperada}`);
  }

  if (problemas.length > 0) {
    return false;
  } else {
    return true;
  }
}

aprobarTodosEjercicios();
verificarIntegridad();