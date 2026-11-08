// ============================================================
// juego.js - ESTADO INICIAL Y ARRANQUE
// El estado de la partida y lo que se ejecuta al abrir el juego.
// Se carga al FINAL: cuando llega aquí, todo lo demás ya existe.
// ============================================================

const estado = {
  dinero: 600,
  madera: 40,
  piedra: 20,
  herramientas: 25,
  poblacion: 0,
  felicidad: FELICIDAD_BASE,
  impuesto: IMPUESTO_INICIAL,   // en %
  dineroInicioAnio: 600,        // para el periódico: cómo empezó el año
  poblacionInicioAnio: 0,
  anio: 700,
  mes: 1,
  seleccion: "camino"   // lo que tienes elegido en la barra: un edificio o "demoler"
};

const camara = { x: 0, y: 0 };

// Dos capas: TERRENO (agua, bosque, montana o null=llanura) y MAPA (lo construido)
const terreno = [];
const mapa = [];
for (let y = 0; y < FILAS; y++) {
  terreno[y] = [];
  mapa[y] = [];
  for (let x = 0; x < COLUMNAS; x++) {
    terreno[y][x] = null;
    mapa[y][x] = null;
  }
}

let semillaMapa = 0;

// Control de la partida y del tiempo
let partidaIniciada = false;   // false mientras estás en el menú
let modalAbierto = true;       // true cuando hay un menú o panel encima: el tiempo se detiene
let velocidad = 1;             // 0 = pausa, 1 = normal, 2 = rápido, 4 = muy rápido
let idTurno = null;            // el temporizador del próximo mes   // el número que define el mapa aleatorio

// Al abrir, no se carga nada todavía: primero aparece el menú
actualizarBotones();
dibujar();
actualizarTiempo();
mostrarMenu();
