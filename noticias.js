// ============================================================
// noticias.js - EL PERIÓDICO
// Los textos de las noticias y la lógica que elige cuáles salen.
// Para agregar noticias, solo añade frases a las listas de abajo.
// En los textos, {pop}, {dp}, {dd}, {imp}, {fel}, {madera}, {caminos} se reemplazan por números.
// ============================================================

const ERAS = [
  { desde: 700,  hasta: 1000, nombre: "Edad Antigua" },
  { desde: 1000, hasta: 1200, nombre: "Edad Media" },
  { desde: 1200, hasta: 1600, nombre: "Edad Imperial" },
  { desde: 1600, hasta: 1900, nombre: "Edad Revolucionaria" },
  { desde: 1900, hasta: 1950, nombre: "Edad Industrial" },
  { desde: 1950, hasta: 2000, nombre: "Edad Medio Moderna" },
  { desde: 2000, hasta: 99999, nombre: "Edad Moderna" }
];

function eraDe(anio) {
  for (const e of ERAS) if (anio >= e.desde && anio < e.hasta) return e.nombre;
  return ERAS[0].nombre;
}

const NOTICIAS = {
  crece: [
    "La población crece: ya son {pop} habitantes (+{dp}).",
    "Llegan nuevas familias: {pop} personas viven ahora en la ciudad."
  ],
  baja: [
    "Familias abandonan la ciudad: quedan {pop} habitantes (-{dp}).",
    "Se marcharon {dp} vecinos en busca de mejor suerte."
  ],
  estable: [
    "Año tranquilo: la población se mantiene en {pop} habitantes."
  ],
  vacia: [
    "La aldea sigue vacía: ¿quién vivirá aquí?",
    "Sin casas conectadas por camino, nadie se queda a vivir."
  ],
  deuda: [
    "Las arcas están en números rojos: se deben {deuda} monedas.",
    "Los acreedores tocan a la puerta: la ciudad debe {deuda} monedas."
  ],
  ganancia: [
    "Las arcas crecen {dd} monedas este año.",
    "Buen año para el tesoro: ganancia de {dd} monedas."
  ],
  sinCambio: [
    "Las arcas siguen igual que hace un año: ni ganancias ni pérdidas."
  ],
  perdida: [
    "Las arcas pierden {dd} monedas este año.",
    "El tesoro se adelgaza: {dd} monedas menos que el año pasado."
  ],
  impuestoAlto: [
    "Vecinos protestan por impuestos del {imp}%.",
    "Los impuestos del {imp}% encienden el descontento en la plaza."
  ],
  impuestoBajo: [
    "Con impuestos de apenas {imp}%, los vecinos sonríen, pero las arcas lo notan."
  ],
  felizMucho: [
    "Ciudadanos contentos: la felicidad llega a {fel}."
  ],
  felizPoco: [
    "Malestar en las calles: la felicidad cae a {fel}.",
    "Se oyen quejas en el mercado: la felicidad es de solo {fel}."
  ],
  sinMadera: [
    "Escasea la madera: quedan {madera} unidades en los almacenes."
  ],
  sinHerramientas: [
    "Faltan herramientas: sin ellas no se pueden abrir más caminos.",
    "Los obreros esperan: no quedan palas ni hachas."
  ],
  obras: [
    "Obras públicas: la ciudad ya cuenta con {caminos} tramos de camino."
  ],
  sinCaminos: [
    "Sin caminos, los edificios no producen: los vecinos reclaman obras."
  ],
  obrasTerminadas: [
    "Se inauguraron {obras} obras este año: la ciudad no deja de construir.",
    "Los albañiles celebran: {obras} edificios terminados en el año."
  ],
  obrasEnMarcha: [
    "Obras en marcha: {enObra} edificios en construcción.",
    "Andamios y polvo por toda la ciudad: {enObra} obras siguen abiertas."
  ],
  color: {
    "Edad Antigua": [
      "Un cometa cruza el cielo y los sabios discuten qué anuncia.",
      "Mercaderes de tierras lejanas cuentan historias de ciudades enormes.",
      "Un viajero asegura haber visto una luz extraña sobre las montañas.",
      "Los ancianos recuerdan inviernos más duros que el de este año.",
      "El herrero del pueblo presume una nueva forma de trabajar el metal."
    ],
    general: [
      "Las noticias de este año son tranquilas.",
      "En la plaza se comenta que algo grande se aproxima."
    ]
  }
};

function elegir(lista) {
  return lista[Math.floor(Math.random() * lista.length)];
}

function llenar(texto, datos) {
  return texto.replace(/\{(\w+)\}/g, function (m, clave) {
    return (clave in datos) ? datos[clave] : m;
  });
}

// Recibe el reporte del año (lo arma turno() en simulacion.js) y devuelve el periódico
function generarPeriodico(r) {
  const era = eraDe(r.anio);
  const dp = r.poblacion - r.poblacionAntes;
  const dd = r.dinero - r.dineroAntes;
  const datos = {
    pop: r.poblacion, dp: Math.abs(dp), dd: Math.abs(dd), deuda: Math.abs(r.dinero),
    imp: r.impuesto, fel: r.felicidad, madera: r.madera, caminos: r.edificios.camino,
    obras: r.obrasTerminadas, enObra: r.enObra
  };

  // Cada candidata tiene prioridad: las más altas salen primero (el azar desempata)
  const candidatas = [];
  function agregar(prioridad, lista) {
    candidatas.push({ p: prioridad + Math.random() * 0.5, t: llenar(elegir(lista), datos) });
  }

  // Población
  if (r.poblacion === 0) agregar(5, NOTICIAS.vacia);
  else if (dp > 0) agregar(8, NOTICIAS.crece);
  else if (dp < 0) agregar(9, NOTICIAS.baja);
  else agregar(3, NOTICIAS.estable);

  // Dinero
  if (r.dinero < 0) agregar(10, NOTICIAS.deuda);
  else if (dd > 0) agregar(6, NOTICIAS.ganancia);
  else if (dd < 0) agregar(7, NOTICIAS.perdida);
  else agregar(3, NOTICIAS.sinCambio);

  // Impuestos y felicidad
  if (r.impuesto >= 20) agregar(9, NOTICIAS.impuestoAlto);
  if (r.impuesto <= 5) agregar(6, NOTICIAS.impuestoBajo);
  if (r.felicidad >= 75) agregar(5, NOTICIAS.felizMucho);
  if (r.felicidad <= 40) agregar(9, NOTICIAS.felizPoco);

  // Recursos y obras
  if (r.madera < 10) agregar(7, NOTICIAS.sinMadera);
  if (r.herramientas < 5) agregar(8, NOTICIAS.sinHerramientas);
  if (r.edificios.camino > 0) agregar(3, NOTICIAS.obras);
  else if (r.edificios.casa > 0) agregar(6, NOTICIAS.sinCaminos);
  if (r.obrasTerminadas > 0) agregar(6, NOTICIAS.obrasTerminadas);
  if (r.enObra > 0) agregar(4, NOTICIAS.obrasEnMarcha);

  // Un toque de ambiente de la época
  agregar(2, NOTICIAS.color[era] || NOTICIAS.color.general);

  candidatas.sort(function (a, b) { return b.p - a.p; });
  return {
    anio: r.anio,
    era: era,
    titular: candidatas[0].t,
    otras: candidatas.slice(1, 4).map(function (c) { return c.t; })
  };
}
