// ============================================================
// interfaz.js - LO QUE SE VE Y SE TOCA
// Dibujo del mapa, barra de construcción, arrastre y teclado.
// ============================================================

function mostrarMensaje(texto) {
  document.getElementById("mensaje").textContent = texto;
}

const canvas = document.getElementById("mapa");
const ctx = canvas.getContext("2d");

function dibujarCamino(x, y) {
  const cx = x * TAM + TAM / 2;
  const cy = y * TAM + TAM / 2;

  // Si debajo hay agua, es un puente: otro color y más grueso
  const esPuente = terreno[y][x] === "agua";
  const color = esPuente ? COLOR_PUENTE : COLOR_CAMINO;
  const grosor = esPuente ? GROSOR_PUENTE : GROSOR_CAMINO;

  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = grosor;
  ctx.lineCap = "butt";

  ctx.beginPath();
  ctx.arc(cx, cy, grosor / 2, 0, Math.PI * 2);
  ctx.fill();

  if (esCamino(x, y - 1)) { ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx, cy - TAM / 2); ctx.stroke(); }
  if (esCamino(x, y + 1)) { ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx, cy + TAM / 2); ctx.stroke(); }
  if (esCamino(x - 1, y)) { ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx - TAM / 2, cy); ctx.stroke(); }
  if (esCamino(x + 1, y)) { ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + TAM / 2, cy); ctx.stroke(); }
}

function limitarCamara() {
  const maxX = COLUMNAS * TAM - canvas.width;
  const maxY = FILAS * TAM - canvas.height;
  camara.x = Math.max(0, Math.min(camara.x, maxX));
  camara.y = Math.max(0, Math.min(camara.y, maxY));
}

function dibujar() {
  limitarCamara();
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.translate(-camara.x, -camara.y);

  const x0 = Math.max(0, Math.floor(camara.x / TAM));
  const x1 = Math.min(COLUMNAS - 1, Math.ceil((camara.x + canvas.width) / TAM));
  const y0 = Math.max(0, Math.floor(camara.y / TAM));
  const y1 = Math.min(FILAS - 1, Math.ceil((camara.y + canvas.height) / TAM));

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const celda = mapa[y][x];
      const t = terreno[y][x];

      // 1) El terreno
      if (t === "agua")    { ctx.fillStyle = COLOR_AGUA;    ctx.fillRect(x * TAM, y * TAM, TAM, TAM); }
      if (t === "bosque")  { ctx.fillStyle = COLOR_BOSQUE;  ctx.fillRect(x * TAM, y * TAM, TAM, TAM); }
      if (t === "montana") { ctx.fillStyle = COLOR_MONTANA; ctx.fillRect(x * TAM, y * TAM, TAM, TAM); }

      ctx.strokeStyle = "rgba(0,0,0,0.15)";
      ctx.lineWidth = 1;
      ctx.strokeRect(x * TAM, y * TAM, TAM, TAM);

      // 2) Lo construido (o, si no hay nada, el dibujo del bioma)
      if (celda === "camino") {
        dibujarCamino(x, y);
      } else if (celda) {
        const conCamino = tieneCamino(x, y);
        ctx.globalAlpha = conCamino ? 1 : 0.5;
        ctx.font = "24px serif";
        ctx.fillText(EDIFICIOS[celda].emoji, x * TAM + TAM / 2, y * TAM + TAM / 2);
        ctx.globalAlpha = 1;

        if (!conCamino) {
          ctx.font = "12px serif";
          ctx.fillText("⚠️", x * TAM + TAM - 8, y * TAM + 8);
        }
      } else if (t === "bosque" || t === "montana") {
        ctx.font = "22px serif";
        ctx.fillText(t === "bosque" ? "🌲" : "⛰️", x * TAM + TAM / 2, y * TAM + TAM / 2);
      }
    }
  }

  ctx.restore();

  document.getElementById("hud").textContent =
    "📅 Año " + estado.anio + " (mes " + estado.mes + ")  💰 " + estado.dinero +
    "  👥 " + estado.poblacion + "  😊 " + Math.round(estado.felicidad) + "  🪵 " + estado.madera + "  🪨 " + estado.piedra +
    "  🔧 " + estado.herramientas;
}

const contenedor = document.getElementById("herramientas");   // fila superior (guardar / nueva partida)
const barra = document.getElementById("barra");

let categoriaActiva = "caminos";

function edificiosDe(categoria) {
  const lista = [];
  for (const id in EDIFICIOS) {
    if (EDIFICIOS[id].categoria === categoria) lista.push(id);
  }
  return lista;
}

function categoriaDe(seleccion) {
  return seleccion === "demoler" ? "demoler" : EDIFICIOS[seleccion].categoria;
}

function elegirCategoria(idCat) {
  categoriaActiva = idCat;
  if (idCat === "demoler") {
    estado.seleccion = "demoler";
  } else {
    const lista = edificiosDe(idCat);
    if (lista.indexOf(estado.seleccion) === -1) estado.seleccion = lista[0];
  }
  construirBarra();
}

function construirBarra() {
  barra.innerHTML = "";

  const pestanas = document.createElement("div");
  pestanas.className = "pestanas";
  for (const idCat in CATEGORIAS) {
    const b = document.createElement("button");
    b.textContent = CATEGORIAS[idCat].emoji + " " + CATEGORIAS[idCat].nombre;
    b.className = (idCat === categoriaActiva) ? "activo" : "";
    b.onclick = function () { elegirCategoria(idCat); };
    pestanas.appendChild(b);
  }
  const bDemoler = document.createElement("button");
  bDemoler.textContent = "🔨 Demoler";
  bDemoler.className = (categoriaActiva === "demoler") ? "activo" : "";
  bDemoler.onclick = function () { elegirCategoria("demoler"); };
  pestanas.appendChild(bDemoler);
  barra.appendChild(pestanas);

  if (categoriaActiva === "demoler") {
    const pista = document.createElement("p");
    pista.className = "pista";
    pista.textContent = "Toca un camino o edificio para demolerlo y recuperar " + Math.round(REEMBOLSO * 100) + "% del costo.";
    barra.appendChild(pista);
    return;
  }

  const items = document.createElement("div");
  items.className = "items";
  for (const id of edificiosDe(categoriaActiva)) {
    const e = EDIFICIOS[id];
    const b = document.createElement("button");
    b.className = "item" + (id === estado.seleccion ? " activo" : "");
    b.innerHTML = '<span class="emo">' + e.emoji + '</span><span class="nom">' + e.nombre +
                  '</span><span class="cos">' + textoCosto(e) + '</span>';
    b.onclick = function () {
      estado.seleccion = id;
      construirBarra();
    };
    items.appendChild(b);
  }
  barra.appendChild(items);
}

function actualizarBotones() {
  categoriaActiva = categoriaDe(estado.seleccion);
  construirBarra();
}

// Arrastrar para mover la cámara. Si el dedo casi no se mueve, es un toque.
let arrastrando = false;
let movio = false;
let inicio = { x: 0, y: 0, camX: 0, camY: 0 };

canvas.addEventListener("pointerdown", function (e) {
  arrastrando = true;
  movio = false;
  inicio = { x: e.clientX, y: e.clientY, camX: camara.x, camY: camara.y };
  canvas.setPointerCapture(e.pointerId);
});

canvas.addEventListener("pointermove", function (e) {
  if (!arrastrando) return;
  const dx = e.clientX - inicio.x;
  const dy = e.clientY - inicio.y;
  if (Math.abs(dx) + Math.abs(dy) > 8) movio = true;

  if (movio) {
    const escala = canvas.width / canvas.getBoundingClientRect().width;
    camara.x = inicio.camX - dx * escala;
    camara.y = inicio.camY - dy * escala;
    dibujar();
  }
});

canvas.addEventListener("pointerup", function (e) {
  if (!arrastrando) return;
  arrastrando = false;
  if (movio) return;

  const rect = canvas.getBoundingClientRect();
  const escala = canvas.width / rect.width;
  const mundoX = (e.clientX - rect.left) * escala + camara.x;
  const mundoY = (e.clientY - rect.top) * escala + camara.y;
  accionEnCasilla(Math.floor(mundoX / TAM), Math.floor(mundoY / TAM));
});

window.addEventListener("keydown", function (e) {
  const paso = TAM * 2;
  const k = e.key.toLowerCase();
  if (k === "arrowleft" || k === "a") camara.x -= paso;
  else if (k === "arrowright" || k === "d") camara.x += paso;
  else if (k === "arrowup" || k === "w") camara.y -= paso;
  else if (k === "arrowdown" || k === "s") camara.y += paso;
  else return;
  e.preventDefault();
  dibujar();
});
