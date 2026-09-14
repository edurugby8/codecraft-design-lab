/**
 * Medidas del producto. 1 unidad ≈ 5 cm; los auriculares miden ~2,7 unidades
 * (≈ 13,5 cm de copa a copa de alto) y 3,1 de ancho.
 *
 * Cada pieza declara además su vector de separación para la vista
 * explosionada, de modo que «explotar» y «reunir» sean la misma curva a la
 * inversa y no haya saltos.
 */

export const M = {
  /** Diadema */
  bandRadius: 1.0,
  bandTube: 0.088,
  /** Aplastamiento de la sección de la diadema (cinta, no tubo) */
  bandFlat: 0.6,
  /** Acolchado interior de la diadema */
  padBandRadius: 0.905,
  padBandTube: 0.062,
  padBandArc: 0.62,

  /** Varillas de extensión */
  armWidth: 0.115,
  armHeight: 0.52,
  armDepth: 0.085,
  armY: -0.17,

  /** Copas */
  cupX: 1.02,
  cupY: -1.02,
  cupRadius: 0.55,
  /** Achatamiento en profundidad: la copa es más alta que honda */
  cupOval: 0.87,

  /** Aro exterior (horquilla / cardán) */
  yokeRadius: 0.62,
  yokeTube: 0.052,

  /** Almohadilla */
  padRadius: 0.4,
  padTube: 0.158,

  /** Rejilla y transductor */
  grilleRadius: 0.36,
} as const;

/** Perfil de la copa para LatheGeometry: [radio, altura] en el eje local Y. */
export const CUP_PROFILE: [number, number][] = [
  [0.0, 0.3],
  [0.09, 0.298],
  [0.2, 0.289],
  [0.31, 0.272],
  [0.4, 0.248],
  [0.47, 0.213],
  [0.515, 0.165],
  [0.54, 0.105],
  [0.55, 0.03],
  [0.55, -0.05],
  [0.538, -0.115],
  [0.505, -0.158],
  [0.45, -0.178],
];

/**
 * Separación de cada pieza en la vista explosionada.
 * Las piezas de la copa se desplazan a lo largo del eje local +Y (que apunta
 * hacia fuera en el mundo), así se despliegan como un estallido por capas.
 */
export const EXPLODE = {
  /** Piezas de la copa, en su espacio local (eje Y = hacia fuera) */
  yoke: 0.98,
  rim: 0.7,
  plate: 0.46,
  shell: 0.15,
  driver: -0.22,
  pad: -0.58,
  /** Piezas globales (mundo) */
  band: [0, 0.85, 0] as [number, number, number],
  bandPad: [0, 0.44, 0] as [number, number, number],
  arm: [0.16, 0.34, 0] as [number, number, number],
};
