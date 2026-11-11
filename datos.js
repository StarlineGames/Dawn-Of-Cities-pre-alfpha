// ============================================================
// datos.js - LOS DATOS DEL JUEGO
// Edificios, categorías, materiales, costos y números de balance.
// Aquí se cambia el contenido del juego sin tocar la lógica.
// Se carga PRIMERO: todos los demás archivos usan estos datos.
// ============================================================

const TAM = 32;          // tamaño de cada casilla en píxeles
const COLUMNAS = 100;    // el mapa ahora es enorme
const FILAS = 70;

// Los materiales del juego
const MATERIALES = {
  madera:       { nombre: "madera",       emoji: "🪵" },
  piedra:       { nombre: "piedra",       emoji: "🪨" },
  herramientas: { nombre: "herramientas", emoji: "🔧" }
};

// costo = dinero. materiales = lo que además se gasta al construir.
// tiempo = meses de obra (0 = instantáneo, como los caminos).
// solo = el terreno donde obligatoriamente debe ir (edificios de bioma).
const EDIFICIOS = {
  camino:     { nombre: "Camino",     emoji: "🟫", costo: 10,  materiales: { herramientas: 1 },             tiempo: 0, categoria: "caminos" },
  casa:       { nombre: "Casa",       emoji: "🏠", costo: 50,  materiales: { madera: 5 },                   tiempo: 3, categoria: "residencial" },
  mercado:    { nombre: "Mercado",    emoji: "🏪", costo: 120, materiales: { madera: 8, piedra: 4 },        tiempo: 6, categoria: "comercial" },
  granja:     { nombre: "Granja",     emoji: "🌾", costo: 80,  materiales: { madera: 4, herramientas: 1 },  tiempo: 4, categoria: "industrial" },
  taller:     { nombre: "Taller de herramientas", emoji: "🛠️", costo: 100, materiales: { madera: 10, piedra: 5 }, tiempo: 5, categoria: "industrial" },
  aserradero: { nombre: "Aserradero", emoji: "🪓", costo: 60,  materiales: { madera: 3, herramientas: 2 },  tiempo: 3, categoria: "recursos", solo: "bosque" },
  cantera:    { nombre: "Cantera",    emoji: "⛏️", costo: 70,  materiales: { madera: 4, herramientas: 2 },  tiempo: 4, categoria: "recursos", solo: "montana" }
};

// Las pestañas de la barra de construcción (en este orden)
const CATEGORIAS = {
  caminos:     { nombre: "Caminos",     emoji: "🛣️" },
  residencial: { nombre: "Residencial", emoji: "🏠" },
  comercial:   { nombre: "Comercial",   emoji: "🏪" },
  industrial:  { nombre: "Industrial",  emoji: "🏭" },
  recursos:    { nombre: "Recursos",    emoji: "⛏️" }
};

// Además de las reglas de cada edificio, en estos terrenos solo se permite esto
// (el terreno "llanura" es null y permite todo lo que no tenga "solo")
const TERRENO_PERMITIDO = {
  agua:    ["camino"],   // el camino sobre agua es un puente
  bosque:  ["camino"],
  montana: []
};

const REEMBOLSO = 0.5;   // al demoler te devuelven la mitad (dinero y materiales)

// Producción mensual
const MADERA_POR_ARBOL = 1;     // cada casilla de bosque cerca del aserradero
const PIEDRA_POR_ROCA = 1;      // cada casilla de montaña cerca de la cantera
const TALLER_USA = { madera: 2, piedra: 1 };
const TALLER_PRODUCE = 3;       // herramientas por mes

// Aspecto
const COLOR_CAMINO = "#a07c4a";
const GROSOR_CAMINO = 12;
const COLOR_PUENTE = "#5e3a1a";
const GROSOR_PUENTE = 16;
const COLOR_AGUA = "#4a90d9";
const COLOR_BOSQUE = "#4f8f45";
const COLOR_MONTANA = "#9a9a9a";

// Umbrales de la generación del mapa (ajústalos para cambiar el paisaje)
const UMBRAL_AGUA = 0.25;
const UMBRAL_MONTANA = 0.72;
const UMBRAL_BOSQUE = 0.66;

// ----- Economía y felicidad -----
const HABITANTES_POR_CASA = 4;
const VALOR_IMPONIBLE = 10;       // lo que "gana" cada habitante al mes; el impuesto es un % de esto
const IMPUESTO_INICIAL = 10;      // en %
const IMPUESTO_MAXIMO = 30;       // en %
const INGRESO_GRANJA = 5;         // por granja conectada, al mes
const INGRESO_MERCADO = 8;        // por mercado conectado, al mes
const MANTENIMIENTO_EDIFICIO = 2; // por edificio, al mes
const MANTENIMIENTO_CAMINO = 1;   // por tramo de camino, al mes

const FELICIDAD_BASE = 80;        // felicidad a la que se tiende con el impuesto neutro
const IMPUESTO_NEUTRO = 10;       // % de impuesto que no sube ni baja la felicidad
const PENALIZACION_IMPUESTO = 2.5;// puntos de felicidad que se pierden por cada 1% sobre el neutro
const PENALIZACION_DEUDA = 15;    // puntos que se pierden si el dinero es negativo
const FELICIDAD_PLENA = 50;       // con menos felicidad que esto, parte de la gente se va
const CAMBIO_FELICIDAD_MES = 3;   // lo máximo que sube o baja la felicidad en un mes

// ----- Tiempo -----
const MS_POR_MES = 1500;          // a velocidad normal, cada mes dura esto
const VELOCIDADES = [
  { valor: 0, texto: "⏸️" },
  { valor: 1, texto: "▶️" },
  { valor: 2, texto: "⏩" },
  { valor: 4, texto: "⏩⏩" }
];
