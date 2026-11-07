// ============================================================
// simulacion.js - LAS REGLAS DEL JUEGO
// Producción, economía, turnos, costos y construir/demoler.
// No dibuja nada: solo cambia los datos del estado.
// ============================================================

function esCamino(x, y) {
  if (x < 0 || x >= COLUMNAS || y < 0 || y >= FILAS) return false;
  return mapa[y][x] === "camino";
}

function tieneCamino(x, y) {
  return esCamino(x, y - 1) || esCamino(x, y + 1) ||
         esCamino(x - 1, y) || esCamino(x + 1, y);
}

// Recorre el mapa UNA vez y cuenta todo lo necesario para el turno
function contar() {
  const r = { todos: {}, activos: {}, madera: 0, piedra: 0 };
  for (const id in EDIFICIOS) { r.todos[id] = 0; r.activos[id] = 0; }

  for (let y = 0; y < FILAS; y++) {
    for (let x = 0; x < COLUMNAS; x++) {
      const id = mapa[y][x];
      if (!id) continue;
      r.todos[id]++;
      if (id === "camino" || !tieneCamino(x, y)) continue;   // sin camino: no produce
      r.activos[id]++;
      // Los edificios de bioma producen según cuánto bioma hay a su alrededor (3x3)
      if (id === "aserradero") r.madera += contarZona(x, y, 1, "bosque") * MADERA_POR_ARBOL;
      if (id === "cantera")    r.piedra += contarZona(x, y, 1, "montana") * PIEDRA_POR_ROCA;
    }
  }
  return r;
}

function turno() {
  const c = contar();

  estado.poblacion = c.activos.casa * 4;

  // Dinero
  const ingresos = estado.poblacion * 1 + c.activos.granja * 5 + c.activos.mercado * 8;
  let edificios = 0;
  for (const id in c.todos) if (id !== "camino") edificios += c.todos[id];
  const gastos = edificios * 2 + c.todos.camino * 1;
  estado.dinero += ingresos - gastos;

  // Materiales extraídos
  estado.madera += c.madera;
  estado.piedra += c.piedra;

  // Cada taller convierte madera y piedra en herramientas (si alcanza)
  for (let i = 0; i < c.activos.taller; i++) {
    if (estado.madera >= TALLER_USA.madera && estado.piedra >= TALLER_USA.piedra) {
      estado.madera -= TALLER_USA.madera;
      estado.piedra -= TALLER_USA.piedra;
      estado.herramientas += TALLER_PRODUCE;
    }
  }

  estado.mes++;
  if (estado.mes > 12) {
    estado.mes = 1;
    estado.anio++;
  }
  guardar(true);   // autoguardado silencioso cada mes del juego
  dibujar();
}

// ¿Se puede construir este edificio en esta casilla? (según el terreno)
function sePuedeConstruir(id, x, y) {
  const e = EDIFICIOS[id];
  const t = terreno[y][x];
  if (e.solo) return t === e.solo;
  if (t === null) return true;
  return TERRENO_PERMITIDO[t].indexOf(id) !== -1;
}

// Lo que falta para poder pagar un edificio (lista vacía = alcanza todo)
function faltantes(e) {
  const falta = [];
  if (estado.dinero < e.costo) falta.push("dinero");
  for (const m in e.materiales) {
    if (estado[m] < e.materiales[m]) falta.push(MATERIALES[m].nombre);
  }
  return falta;
}

function textoCosto(e) {
  let t = "$" + e.costo;
  for (const m in e.materiales) t += " " + MATERIALES[m].emoji + e.materiales[m];
  return t;
}

// Acción al tocar una casilla (construir o demoler)
function accionEnCasilla(x, y) {
  if (x < 0 || x >= COLUMNAS || y < 0 || y >= FILAS) return;
  const celda = mapa[y][x];

  if (estado.seleccion === "demoler") {
    if (celda === null) return;
    const e = EDIFICIOS[celda];
    estado.dinero += Math.floor(e.costo * REEMBOLSO);
    for (const m in e.materiales) estado[m] += Math.floor(e.materiales[m] * REEMBOLSO);
    mapa[y][x] = null;
    dibujar();
    return;
  }

  if (celda !== null) return;   // casilla ocupada
  const id = estado.seleccion;
  const edificio = EDIFICIOS[id];

  if (!sePuedeConstruir(id, x, y)) {
    mostrarMensaje(edificio.solo
      ? "⚠️ " + edificio.nombre + " solo se construye sobre " + (edificio.solo === "bosque" ? "bosque 🌲" : "montaña ⛰️") + "."
      : "⚠️ No se puede construir eso en este terreno.");
    return;
  }
  const falta = faltantes(edificio);
  if (falta.length > 0) {
    mostrarMensaje("⚠️ Te falta: " + falta.join(", ") + ".");
    return;
  }

  estado.dinero -= edificio.costo;
  for (const m in edificio.materiales) estado[m] -= edificio.materiales[m];
  mapa[y][x] = id;
  dibujar();
}
