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

// Calcula qué edificios están conectados y pueden producir:
//  - cualquier edificio terminado con un camino al lado
//  - las granjas terminadas pegadas a una granja ya conectada (el grupo se encadena)
// Las obras en construcción no cuentan ni pasan la conexión.
function recalcularConexiones() {
  const cola = [];
  for (let y = 0; y < FILAS; y++) {
    for (let x = 0; x < COLUMNAS; x++) {
      conexion[y][x] = false;
      const id = mapa[y][x];
      if (!id || id === "camino" || obras[y][x] !== null) continue;
      if (tieneCamino(x, y)) {
        conexion[y][x] = true;
        if (id === "granja") cola.push([x, y]);
      }
    }
  }
  // Las granjas conectadas contagian la conexión a las granjas terminadas que tocan
  while (cola.length > 0) {
    const [x, y] = cola.pop();
    const vecinos = [[x, y - 1], [x, y + 1], [x - 1, y], [x + 1, y]];
    for (const [vx, vy] of vecinos) {
      if (vx < 0 || vx >= COLUMNAS || vy < 0 || vy >= FILAS) continue;
      if (mapa[vy][vx] === "granja" && obras[vy][vx] === null && !conexion[vy][vx]) {
        conexion[vy][vx] = true;
        cola.push([vx, vy]);
      }
    }
  }
}

// Recorre el mapa UNA vez y cuenta todo lo necesario para el turno
function contar() {
  recalcularConexiones();
  const r = { todos: {}, activos: {}, madera: 0, piedra: 0, enObra: 0 };
  for (const id in EDIFICIOS) { r.todos[id] = 0; r.activos[id] = 0; }

  for (let y = 0; y < FILAS; y++) {
    for (let x = 0; x < COLUMNAS; x++) {
      const id = mapa[y][x];
      if (!id) continue;
      if (obras[y][x] !== null) { r.enObra++; continue; }   // en obra: no produce ni paga mantenimiento
      r.todos[id]++;
      if (id === "camino" || !conexion[y][x]) continue;      // sin conexión: no produce
      r.activos[id]++;
      // Los edificios de bioma producen según cuánto bioma hay a su alrededor (3x3)
      if (id === "aserradero") r.madera += contarZona(x, y, 1, "bosque") * MADERA_POR_ARBOL;
      if (id === "cantera")    r.piedra += contarZona(x, y, 1, "montana") * PIEDRA_POR_ROCA;
    }
  }
  return r;
}

// ----- Economía -----
function poblacionPosible(c) {
  return c.activos.casa * HABITANTES_POR_CASA;
}

// Con menos felicidad que FELICIDAD_PLENA, solo se queda una parte de la gente
function factorFelicidad() {
  return Math.min(1, estado.felicidad / FELICIDAD_PLENA);
}

// Hacia dónde tiende la felicidad según los impuestos (y si hay deuda)
function felicidadObjetivo() {
  let o = FELICIDAD_BASE - (estado.impuesto - IMPUESTO_NEUTRO) * PENALIZACION_IMPUESTO;
  if (estado.dinero < 0) o -= PENALIZACION_DEUDA;
  return Math.max(0, Math.min(100, o));
}

// El presupuesto de un mes: de dónde viene el dinero y a dónde se va
function calcularEconomia(c) {
  const posible = poblacionPosible(c);
  const poblacion = Math.round(posible * factorFelicidad());
  const impuestos = Math.round(poblacion * VALOR_IMPONIBLE * estado.impuesto / 100);
  const granjas = c.activos.granja * INGRESO_GRANJA;
  const mercados = c.activos.mercado * INGRESO_MERCADO;

  let edificios = 0;
  for (const id in c.todos) if (id !== "camino") edificios += c.todos[id];
  const mantEdificios = edificios * MANTENIMIENTO_EDIFICIO;
  const mantCaminos = c.todos.camino * MANTENIMIENTO_CAMINO;

  const ingresos = impuestos + granjas + mercados;
  const gastos = mantEdificios + mantCaminos;
  return { posible, poblacion, impuestos, granjas, mercados,
           mantEdificios, mantCaminos, ingresos, gastos, balance: ingresos - gastos };
}

function turno() {
  const c = contar();

  // La felicidad se acerca poco a poco a su objetivo
  const dif = felicidadObjetivo() - estado.felicidad;
  estado.felicidad += Math.max(-CAMBIO_FELICIDAD_MES, Math.min(CAMBIO_FELICIDAD_MES, dif));

  // Población y dinero del mes
  const eco = calcularEconomia(c);
  estado.poblacion = eco.poblacion;
  estado.dinero += eco.balance;

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

  // Avanzan las obras: a cada una le falta un mes menos
  const terminadas = [];
  for (let y = 0; y < FILAS; y++) {
    for (let x = 0; x < COLUMNAS; x++) {
      if (obras[y][x] === null) continue;
      obras[y][x]--;
      if (obras[y][x] <= 0) {
        obras[y][x] = null;
        terminadas.push(EDIFICIOS[mapa[y][x]].nombre);
      }
    }
  }
  if (terminadas.length > 0) {
    estado.obrasTerminadasAnio += terminadas.length;
    recalcularConexiones();   // una granja terminada puede conectar a otras
    mostrarMensaje("🏗️ Obra terminada: " +
      (terminadas.length <= 2 ? terminadas.join(" y ") : terminadas.length + " edificios") + ".");
  }

  estado.mes++;
  let reporte = null;
  if (estado.mes > 12) {
    estado.mes = 1;
    estado.anio++;
    // Fin de año: se reúne lo que pasó para el periódico
    reporte = {
      anio: estado.anio - 1,
      poblacion: estado.poblacion, poblacionAntes: estado.poblacionInicioAnio,
      dinero: estado.dinero, dineroAntes: estado.dineroInicioAnio,
      felicidad: Math.round(estado.felicidad), impuesto: estado.impuesto,
      balance: eco.balance,
      madera: estado.madera, piedra: estado.piedra, herramientas: estado.herramientas,
      edificios: c.todos,
      obrasTerminadas: estado.obrasTerminadasAnio,
      enObra: c.enObra - terminadas.length
    };
    estado.dineroInicioAnio = estado.dinero;
    estado.poblacionInicioAnio = estado.poblacion;
    estado.obrasTerminadasAnio = 0;
  }

  guardar(true);   // autoguardado silencioso cada mes del juego
  dibujar();
  if (reporte) mostrarPeriodico(reporte);   // abre el periódico y detiene el tiempo
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
  if (e.tiempo > 0) t += " ⏱️" + e.tiempo;   // meses de obra
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
    obras[y][x] = null;   // si era una obra, se cancela
    recalcularConexiones();
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
  if (edificio.tiempo > 0) {
    obras[y][x] = edificio.tiempo;   // empieza la obra: faltan "tiempo" meses
    mostrarMensaje("🚧 Obra iniciada: " + edificio.nombre + " (" + edificio.tiempo + " meses).");
  }
  recalcularConexiones();
  dibujar();
}
