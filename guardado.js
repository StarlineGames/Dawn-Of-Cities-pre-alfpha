// ============================================================
// guardado.js - GUARDAR Y CARGAR
// Guarda la semilla y las construcciones en el navegador (localStorage).
// Se carga DESPUÉS de interfaz.js porque agrega botones a la pantalla.
// ============================================================

// Del mapa solo guardamos la SEMILLA (el terreno se regenera igual) y la lista de
// construcciones. Así el guardado es pequeño aunque el mapa sea enorme.
const CLAVE_GUARDADO = "dawn-of-cities-partida";
const VERSION_GUARDADO = 2;   // subió a 2: el formato cambió (semilla + construcciones)
let borrando = false;

function guardar(silencioso) {
  if (borrando) return;
  try {
    const construcciones = [];
    for (let y = 0; y < FILAS; y++) {
      for (let x = 0; x < COLUMNAS; x++) {
        if (mapa[y][x]) construcciones.push([x, y, mapa[y][x]]);
      }
    }
    const datos = { version: VERSION_GUARDADO, semilla: semillaMapa, estado: estado,
                    camara: camara, construcciones: construcciones };
    localStorage.setItem(CLAVE_GUARDADO, JSON.stringify(datos));
    if (!silencioso) mostrarMensaje("💾 Partida guardada");
  } catch (e) {
    mostrarMensaje("⚠️ No se pudo guardar (¿modo incógnito o almacenamiento bloqueado?)");
  }
}

// Devuelve true si cargó una partida; false si hay que empezar una nueva
function cargar() {
  try {
    const texto = localStorage.getItem(CLAVE_GUARDADO);
    if (!texto) return false;

    const datos = JSON.parse(texto);
    if (datos.version !== VERSION_GUARDADO) {
      mostrarMensaje("⚠️ El guardado es de una versión anterior. Empezamos partida nueva.");
      return false;
    }
    if (typeof datos.semilla !== "number" || !Array.isArray(datos.construcciones)) return false;

    // Primero se revisa todo; si algo está mal, no se toca nada
    const validas = [];
    for (const c of datos.construcciones) {
      if (!Array.isArray(c)) continue;
      const x = c[0], y = c[1], id = c[2];
      if (Number.isInteger(x) && Number.isInteger(y) && x >= 0 && x < COLUMNAS &&
          y >= 0 && y < FILAS && EDIFICIOS.hasOwnProperty(id)) validas.push(c);
    }

    semillaMapa = datos.semilla;
    const punto = generarMundo(semillaMapa);   // regenera el mismo terreno
    for (const c of validas) mapa[c[1]][c[0]] = c[2];

    const e = datos.estado || {};
    for (const campo of ["dinero", "madera", "piedra", "herramientas", "poblacion", "anio", "mes"]) {
      if (typeof e[campo] === "number") estado[campo] = e[campo];
    }
    if (e.seleccion === "demoler" || EDIFICIOS.hasOwnProperty(e.seleccion)) {
      estado.seleccion = e.seleccion;
    }
    if (datos.camara && typeof datos.camara.x === "number" && typeof datos.camara.y === "number") {
      camara.x = datos.camara.x;
      camara.y = datos.camara.y;
    } else {
      centrarCamara(punto);
    }
    mostrarMensaje("📂 Partida cargada");
    return true;
  } catch (e) {
    mostrarMensaje("⚠️ No se pudo cargar la partida guardada.");
    return false;
  }
}

const botonGuardar = document.createElement("button");
botonGuardar.textContent = "💾 Guardar";
botonGuardar.onclick = function () { guardar(false); };
contenedor.appendChild(botonGuardar);

const botonNueva = document.createElement("button");
botonNueva.textContent = "🗑️ Nueva partida";
botonNueva.onclick = function () {
  if (!confirm("¿Borrar la partida guardada y empezar de nuevo con un mapa nuevo?")) return;
  borrando = true;
  try { localStorage.removeItem(CLAVE_GUARDADO); } catch (e) {}
  location.reload();
};
contenedor.appendChild(botonNueva);

document.addEventListener("visibilitychange", function () {
  if (document.visibilityState === "hidden") guardar(true);
});
window.addEventListener("pagehide", function () { guardar(true); });
