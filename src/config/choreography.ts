/**
 * Coreografía — fuente única de verdad de la animación.
 *
 * Toda la escena 3D vive en un único lienzo persistente. Cada sección del
 * documento declara una POSE; GSAP/ScrollTrigger interpola el objeto de
 * estado `stage` entre poses con `scrub`, de modo que avanzar y retroceder
 * recorren exactamente la misma curva y no hay saltos en los límites.
 *
 * Unidades: 1 unidad ≈ 5 cm. Los auriculares miden ~2,2 unidades de alto.
 * Ajusta aquí los valores; no hay números de animación repartidos por los
 * componentes.
 */

/** Estado continuo de la escena. Todos los campos son numéricos e interpolables. */
export type StagePose = {
  /** Cámara */
  camX: number;
  camY: number;
  camZ: number;
  /** Punto al que mira la cámara */
  lookY: number;
  fov: number;

  /** Transformación del producto */
  rotX: number;
  rotY: number;
  rotZ: number;
  posX: number;
  posY: number;
  posZ: number;
  scale: number;

  /** Estados de escena (0..1) */
  explode: number;
  labels: number;
  waves: number;
  /** Intensidad del halo de acento detrás del producto */
  glow: number;
  /** Opacidad del charco de luz bajo el producto */
  floor: number;
  /**
   * 1 = la cámara retrocede lo necesario para que el producto entero quepa en
   * cualquier proporción de pantalla. 0 = primer plano deliberado, donde
   * recortar forma parte de la composición.
   */
  fit: number;
};

export type PoseName =
  | 'intro'
  | 'producto'
  | 'relato1'
  | 'relato2'
  | 'relato3'
  | 'relato4'
  | 'sonido'
  | 'acabados'
  | 'detalle1'
  | 'detalle2'
  | 'cierre';

const base: StagePose = {
  camX: 0,
  camY: 0,
  camZ: 5.4,
  lookY: 0,
  fov: 38,
  rotX: 0.1,
  rotY: -0.5,
  rotZ: 0,
  posX: 0,
  posY: 0,
  posZ: 0,
  scale: 1,
  explode: 0,
  labels: 0,
  waves: 0,
  glow: 0.25,
  floor: 0,
  fit: 1,
};

const pose = (p: Partial<StagePose>): StagePose => ({ ...base, ...p });

/**
 * El producto gira de forma acumulativa a lo largo de la página (rotY siempre
 * creciente) para que el recorrido se lea como una sola toma continua.
 */
export const POSES: Record<PoseName, StagePose> = {
  // 1 · Entrada — el producto entra girando, desplazado a la derecha
  intro: pose({
    camZ: 8.4,
    camY: 0.1,
    rotY: -0.5,
    rotX: 0.14,
    posX: 1.75,
    posY: -0.05,
    scale: 1.02,
    glow: 0.35,
    floor: 0.35,
  }),

  // 2 · Producto interactivo — centrado y cerca, listo para arrastrar
  producto: pose({
    camZ: 6.5,
    camY: 0.05,
    rotY: 0.5,
    rotX: 0.08,
    posX: 1.15,
    scale: 1.06,
    glow: 0.5,
    floor: 0.55,
  }),

  // 3 · Relato · el producto se acerca y cambia de orientación
  relato1: pose({
    camZ: 3.1,
    camX: 0.35,
    camY: 0.15,
    lookY: 0.05,
    rotY: 1.5,
    rotX: 0.22,
    rotZ: -0.08,
    posX: 0.1,
    scale: 1.16,
    glow: 0.45,
    floor: 0.3,
    fit: 0,
  }),

  // 4 · Relato · vista explosionada
  relato2: pose({
    camZ: 5.9,
    camY: 0.05,
    rotY: 2.8,
    rotX: 0.05,
    rotZ: 0,
    posX: 0.25,
    scale: 1.02,
    explode: 1,
    glow: 0.42,
    floor: 0,
  }),

  // 5 · Relato · etiquetas sobre las piezas
  relato3: pose({
    camZ: 6.1,
    camX: -0.15,
    rotY: 3.14,
    rotX: 0.03,
    posX: 0.3,
    scale: 1,
    explode: 1,
    labels: 1,
    glow: 0.34,
    floor: 0,
  }),

  // 6 · Relato · las piezas se reúnen
  relato4: pose({
    camZ: 6.7,
    rotY: 4.4,
    rotX: 0.12,
    posX: 0,
    scale: 1.05,
    explode: 0,
    labels: 0,
    glow: 0.5,
    floor: 0.5,
  }),

  // 7 · Sonido convertido en imagen
  sonido: pose({
    camZ: 7.4,
    camY: 0.55,
    lookY: 0.18,
    rotY: 5.3,
    rotX: 0.2,
    posY: 0.52,
    scale: 0.82,
    waves: 1,
    glow: 0.65,
    floor: 0,
  }),

  // 8 · Selector de acabados
  acabados: pose({
    camZ: 6.1,
    rotY: 6.28,
    rotX: 0.06,
    posX: -1.15,
    scale: 1.1,
    glow: 0.6,
    floor: 0.7,
  }),

  // 9 · Detalles · primer plano de la copa
  detalle1: pose({
    camZ: 2.0,
    camX: 0.55,
    camY: -0.12,
    lookY: -0.05,
    fov: 32,
    rotY: 7.1,
    rotX: 0.05,
    rotZ: 0.05,
    posX: 0.2,
    scale: 1.2,
    glow: 0.35,
    floor: 0.2,
    fit: 0,
  }),

  // 10 · Detalles · diadema y articulación
  detalle2: pose({
    camZ: 2.3,
    camX: -0.35,
    camY: 0.45,
    lookY: 0.3,
    fov: 34,
    rotY: 7.9,
    rotX: -0.1,
    posX: -0.1,
    posY: -0.15,
    scale: 1.18,
    glow: 0.3,
    floor: 0.15,
    fit: 0,
  }),

  // 11 · Cierre — composición completa, centrada
  cierre: pose({
    camZ: 7.4,
    camY: 0.05,
    rotY: 12.07,
    rotX: 0.12,
    posX: 0,
    posY: -0.34,
    scale: 1.0,
    glow: 0.75,
    floor: 0.8,
  }),
};

/** Pose de arranque de la entrada: fuera de cuadro, girada y pequeña. */
export const INTRO_START: Partial<StagePose> = {
  camZ: 11.5,
  rotY: -2.9,
  rotX: 0.5,
  posY: -0.75,
  posX: 1.3,
  scale: 0.55,
  glow: 0,
  floor: 0,
};

/**
 * Tiempos (segundos) de la entrada del producto. Los revelados de texto se
 * escalonan desde el CSS (`--retardo`), no desde aquí.
 */
export const INTRO = {
  product: { duration: 2.2, delay: 0.35 },
} as const;

/** Movimiento ocioso: respiración y deriva del producto cuando nada lo mueve. */
export const IDLE = {
  /** Amplitud vertical (unidades) y periodo (s) */
  floatAmplitude: 0.045,
  floatPeriod: 6.5,
  /** Balanceo continuo */
  swayAmplitude: 0.055,
  swayPeriod: 11,
  /** Giro lento de la escena de producto */
  autoSpin: 0.06,
} as const;

/** Respuesta al cursor: suave, nunca mareante. */
export const POINTER = {
  /** Rotación máxima añadida por el puntero (radianes) */
  maxRotY: 0.22,
  maxRotX: 0.14,
  /** Paralaje de cámara (unidades) */
  camParallaxX: 0.22,
  camParallaxY: 0.16,
  /** Suavizado (mayor = más rápido) */
  damping: 3.2,
} as const;

/** Arrastre manual en la escena de producto. */
export const DRAG = {
  /** Radianes por píxel */
  sensitivityX: 0.0075,
  sensitivityY: 0.004,
  /** Límite vertical para que el producto nunca quede del revés */
  maxPitch: 0.6,
  /** Inercia tras soltar */
  friction: 0.94,
} as const;

/** Campo de ondas de la escena «sonido». */
export const WAVES = {
  /** Filas x columnas por nivel de calidad */
  grid: { alto: [46, 26], medio: [34, 18], bajo: [22, 12] },
  spacing: 0.3,
  /** Altura máxima de una barra */
  maxHeight: 1.35,
  /** Velocidad de propagación */
  speed: 1.15,
  /** Radio de influencia del cursor */
  pointerRadius: 2.6,
  pointerLift: 0.85,
} as const;

/**
 * Ancho mínimo para mostrar las etiquetas flotantes en la escena 3D. Por
 * debajo, el listado de piezas del documento ocupa su lugar (ver global.css).
 */
export const ANCHO_ETIQUETAS_3D = 1100;

/** Duración del cambio de acabado (ms) — coherente con el CSS. */
export const UI = {
  finishSwap: 900,
} as const;

/**
 * Ajuste a pantalla estrecha.
 *
 * En vertical el producto tiene su propia franja en la parte superior (ver
 * `.lienzo` en global.css) y el texto ocupa la inferior, así que la escena se
 * centra horizontalmente en lugar de mantener las composiciones asimétricas
 * de escritorio, que ahí dejarían el producto fuera de sitio.
 */
export function ajustarAPantalla(p: StagePose, estrecha: boolean) {
  if (!estrecha) return;
  p.posX *= 0.06;
  p.camX *= 0.25;
}
