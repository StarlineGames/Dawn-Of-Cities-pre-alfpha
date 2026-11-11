// ============================================================
// mundo.js - GENERACIÓN DEL MAPA ALEATORIO
// Semilla, ruido, biomas, río y punto de inicio.
// Llena el terreno según la semilla (usa TERRENO y MAPA de juego.js).
// ============================================================

// ----- Generador de números aleatorios con semilla -----
// Misma semilla = mismos números = mismo mapa. Así solo guardamos la semilla.
function crearAleatorio(semilla) {
  let a = semilla >>> 0;
  return function () {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ----- Ruido suave: valores aleatorios en una malla, mezclados entre sí -----
// "celda" es el tamaño de los rasgos: grande = montañas y lagos amplios
function crearRuido(azar, celda) {
  const w = Math.ceil(COLUMNAS / celda) + 2;
  const h = Math.ceil(FILAS / celda) + 2;
  const g = [];
  for (let j = 0; j < h; j++) {
    g[j] = [];
    for (let i = 0; i < w; i++) g[j][i] = azar();
  }
  return function (x, y) {
    const fx = x / celda, fy = y / celda;
    const i = Math.floor(fx), j = Math.floor(fy);
    const tx = fx - i, ty = fy - j;
    const sx = tx * tx * (3 - 2 * tx), sy = ty * ty * (3 - 2 * ty);   // suaviza
    const a = g[j][i] + (g[j][i + 1] - g[j][i]) * sx;
    const b = g[j + 1][i] + (g[j + 1][i + 1] - g[j + 1][i]) * sx;
    return a + (b - a) * sy;
  };
}

// Llena el terreno según la semilla y devuelve un buen punto de inicio
function generarTerreno(semilla) {
  const azar = crearAleatorio(semilla);
  const altura1 = crearRuido(azar, 14);
  const altura2 = crearRuido(azar, 6);
  const humedad = crearRuido(azar, 10);

  for (let y = 0; y < FILAS; y++) {
    for (let x = 0; x < COLUMNAS; x++) {
      const h = altura1(x, y) * 0.7 + altura2(x, y) * 0.3;   // altura del terreno
      let t = null;
      if (h < UMBRAL_AGUA) t = "agua";                        // valles bajos = lagos
      else if (h > UMBRAL_MONTANA) t = "montana";             // zonas altas = montañas
      else if (humedad(x, y) > UMBRAL_BOSQUE) t = "bosque";   // zonas húmedas = bosques
      terreno[y][x] = t;
      mapa[y][x] = null;
      obras[y][x] = null;
      conexion[y][x] = false;
    }
  }

  // Un río que baja de arriba a abajo, desviándose al azar (2 casillas de ancho)
  let rx = Math.floor(COLUMNAS * (0.2 + azar() * 0.6));
  for (let y = 0; y < FILAS; y++) {
    terreno[y][rx] = "agua";
    terreno[y][rx + 1] = "agua";
    const r = azar();
    if (r < 0.3) rx--; else if (r < 0.6) rx++;
    rx = Math.max(1, Math.min(rx, COLUMNAS - 3));
  }

  // Punto de inicio: la zona de llanura más amplia cerca del centro
  let mejor = { x: COLUMNAS >> 1, y: FILAS >> 1, puntos: -1 };
  for (let y = Math.floor(FILAS * 0.25); y < FILAS * 0.75; y++) {
    for (let x = Math.floor(COLUMNAS * 0.25); x < COLUMNAS * 0.75; x++) {
      const p = contarZona(x, y, 4, null);
      if (p > mejor.puntos) mejor = { x: x, y: y, puntos: p };
    }
  }
  return mejor;
}

// Cuenta casillas de un tipo de terreno en un cuadrado de radio r alrededor de (x, y)
function contarZona(x, y, r, tipo) {
  let total = 0;
  for (let j = y - r; j <= y + r; j++) {
    for (let i = x - r; i <= x + r; i++) {
      if (i < 0 || i >= COLUMNAS || j < 0 || j >= FILAS) continue;
      if (terreno[j][i] === tipo) total++;
    }
  }
  return total;
}

// Prueba semillas derivadas hasta que cerca del inicio haya bosque y montaña
function generarMundo(semillaBase) {
  let inicio = null;
  for (let intento = 0; intento < 40; intento++) {
    inicio = generarTerreno(semillaBase + intento * 7919);
    const bosque = contarZona(inicio.x, inicio.y, 14, "bosque");
    const montana = contarZona(inicio.x, inicio.y, 14, "montana");
    if (bosque >= 25 && montana >= 12) break;
  }
  return inicio;
}

function centrarCamara(punto) {
  camara.x = punto.x * TAM - canvas.width / 2;
  camara.y = punto.y * TAM - canvas.height / 2;
}

function iniciarNuevo() {
  semillaMapa = Math.floor(Math.random() * 1000000000);
  centrarCamara(generarMundo(semillaMapa));
}

