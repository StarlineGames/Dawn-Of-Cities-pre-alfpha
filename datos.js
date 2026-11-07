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
// solo = el terreno donde obligatoriamente debe ir (edificios de bioma).
const EDIFICIOS = {
  camino:     { nombre: "Camino",     emoji: "🟫", costo: 10,  materiales: { herramientas: 1 },             categoria: "caminos" },
  casa:       { nombre: "Casa",       emoji: "🏠", costo: 50,  materiales: { madera: 5 },                   categoria: "residencial" },
  mercado:    { nombre: "Mercado",    emoji: "🏪", costo: 120, materiales: { madera: 8, piedra: 4 },        categoria: "comercial" },
  granja:     { nombre: "Granja",     emoji: "🌾", costo: 80,  materiales: { madera: 4, herramientas: 1 },  categoria: "industrial" },
  taller:     { nombre: "Taller de herramientas", emoji: "🛠️", costo: 100, materiales: { madera: 10, piedra: 5 }, categoria: "industrial" },
  aserradero: { nombre: "Aserradero", emoji: "🪓", costo: 60,  materiales: { madera: 3, herramientas: 2 },  categoria: "recursos", solo: "bosque" },
  cantera:    { nombre: "Cantera",    emoji: "⛏️", costo: 70,  materiales: { madera: 4, herramientas: 2 },  categoria: "recursos", solo: "montana" }
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

