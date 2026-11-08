// ============================================================
// paneles.js - MENÚ, ECONOMÍA, PERIÓDICO Y CONTROL DEL TIEMPO
// Las "capas" son pantallas que se abren encima del juego.
// Mientras una capa está abierta, el tiempo se detiene.
// ============================================================

// ----- Capas -----
function abrirCapa(id) {
  document.getElementById(id).style.display = "flex";
  modalAbierto = true;
  clearTimeout(idTurno);
}

function cerrarCapa(id) {
  document.getElementById(id).style.display = "none";
  modalAbierto = false;
  programarTurno();   // el tiempo vuelve a correr (si no está en pausa)
}

// ----- Tiempo: pausa y velocidades -----
const contTiempo = document.getElementById("tiempo");

function actualizarTiempo() {
  contTiempo.innerHTML = "";
  for (const v of VELOCIDADES) {
    const b = document.createElement("button");
    b.textContent = v.texto;
    b.className = (v.valor === velocidad) ? "activo" : "";
    b.onclick = function () { cambiarVelocidad(v.valor); };
    contTiempo.appendChild(b);
  }
}

function cambiarVelocidad(v) {
  velocidad = v;
  actualizarTiempo();
  programarTurno();
}

// Programa el próximo mes. Si hay pausa o una capa abierta, no programa nada.
function programarTurno() {
  clearTimeout(idTurno);
  if (velocidad === 0 || modalAbierto) return;
  idTurno = setTimeout(function () {
    turno();
    programarTurno();
  }, MS_POR_MES / velocidad);
}

// ----- Menú de inicio -----
function mostrarMenu() {
  const hay = hayGuardado();
  document.getElementById("btn-continuar").disabled = !hay;
  document.getElementById("menu-aviso").textContent = hay ? "" : "Aún no hay partida guardada.";
  abrirCapa("menu");
}

function empezarPartida() {
  partidaIniciada = true;
  cerrarCapa("menu");
}

function menuNueva() {
  if (hayGuardado() && !confirm("Ya tienes una partida guardada. Si empiezas una nueva, se reemplazará. ¿Continuar?")) return;
  iniciarNuevo();
  actualizarBotones();
  dibujar();
  empezarPartida();
}

function menuContinuar() {
  if (!cargar()) return;
  actualizarBotones();
  dibujar();
  empezarPartida();
}

// ----- Panel de economía -----
function conSigno(n) {
  return (n >= 0 ? "+" : "−") + Math.abs(n);
}

function emojiFelicidad(f) {
  if (f >= 75) return "😄";
  if (f >= 55) return "🙂";
  if (f >= 40) return "😐";
  return "😠";
}

function fila(texto, valor, clase) {
  return '<tr class="' + (clase || "") + '"><td>' + texto + '</td><td>' + valor + '</td></tr>';
}

function cambiarImpuesto(delta) {
  estado.impuesto = Math.max(0, Math.min(IMPUESTO_MAXIMO, estado.impuesto + delta));
  actualizarEconomia();
}

function actualizarEconomia() {
  const e = calcularEconomia(contar());
  const f = Math.round(estado.felicidad);
  const objetivo = Math.round(felicidadObjetivo());

  document.getElementById("econ-contenido").innerHTML =
    '<h3>Impuestos</h3>' +
    '<div class="impuesto">' +
      '<button onclick="cambiarImpuesto(-5)">−5</button>' +
      '<button onclick="cambiarImpuesto(-1)">−1</button>' +
      '<b>' + estado.impuesto + '%</b>' +
      '<button onclick="cambiarImpuesto(1)">+1</button>' +
      '<button onclick="cambiarImpuesto(5)">+5</button>' +
    '</div>' +
    '<h3>Felicidad</h3>' +
    '<p>' + emojiFelicidad(f) + ' <b>' + f + '</b>/100 <small>(tiende a ' + objetivo + ')</small></p>' +
    '<div class="barra-fel"><div style="width:' + f + '%"></div></div>' +
    '<p class="pista">Los impuestos altos bajan la felicidad. Con menos de ' + FELICIDAD_PLENA +
      ' de felicidad, parte de los habitantes se va. Ahora: ' + e.poblacion + ' de ' + e.posible + ' posibles.</p>' +
    '<h3>Presupuesto mensual</h3>' +
    '<table>' +
      fila('Impuestos', conSigno(e.impuestos)) +
      fila('Granjas', conSigno(e.granjas)) +
      fila('Mercados', conSigno(e.mercados)) +
      fila('Ingresos', conSigno(e.ingresos), 'total') +
      fila('Mantenimiento de edificios', conSigno(-e.mantEdificios)) +
      fila('Mantenimiento de caminos', conSigno(-e.mantCaminos)) +
      fila('Gastos', conSigno(-e.gastos), 'total') +
      fila('Balance', conSigno(e.balance), 'total ' + (e.balance >= 0 ? 'bien' : 'mal')) +
    '</table>' +
    '<p>💰 Reservas: <b>' + estado.dinero + '</b></p>';
}

function mostrarEconomia() {
  actualizarEconomia();
  abrirCapa("panel-economia");
}

// ----- Periódico -----
function mostrarPeriodico(reporte) {
  const p = generarPeriodico(reporte);
  let html = '<div class="cabecera">📰 EL HERALDO</div>' +
             '<div class="fecha">Año ' + p.anio + ' · ' + p.era + '</div>' +
             '<h2 class="titular">' + p.titular + '</h2><ul>';
  for (const t of p.otras) html += '<li>' + t + '</li>';
  html += '</ul>';
  document.getElementById("periodico-contenido").innerHTML = html;
  abrirCapa("periodico");
}

// ----- Botones de la fila superior -----
const botonEconomia = document.createElement("button");
botonEconomia.textContent = "🪙 Economía";
botonEconomia.onclick = mostrarEconomia;
contenedor.appendChild(botonEconomia);

const botonMenu = document.createElement("button");
botonMenu.textContent = "🏠 Menú";
botonMenu.onclick = function () {
  guardar(true);        // se guarda y se recarga la página: aparece el menú de inicio
  location.reload();
};
contenedor.appendChild(botonMenu);
