/**
 * Extensión del producto en pantalla.
 *
 * El encuadre automático necesita saber cuánto ocupa el producto. En lugar de
 * mantener constantes escritas a mano (que se desajustan en cuanto cambia una
 * medida del modelo), se mide una vez la caja real en el espacio local y
 * después se transforma analíticamente con la rotación, la escala y la
 * posición del fotograma. Ocho esquinas por fotograma: más barato que recorrer
 * la jerarquía, y siempre exacto.
 */

import * as THREE from 'three';
import { EXPLODE } from './geometry';
import type { StageState } from '../lib/stageState';

export type Extremos = { minX: number; maxX: number; minY: number; maxY: number };

/** Caja local del producto sin explotar. Se rellena al montar el modelo. */
export const cajaLocal = new THREE.Box3(
  // Valores de reserva razonables hasta la primera medición.
  new THREE.Vector3(-1.62, -1.75, -0.75),
  new THREE.Vector3(1.62, 1.1, 0.75),
);

let medida = false;

export function medirProducto(objeto: THREE.Object3D) {
  if (medida) return;
  const box = new THREE.Box3().setFromObject(objeto);
  if (box.isEmpty()) return;
  cajaLocal.copy(box);
  medida = true;
}

const euler = new THREE.Euler();
const matriz = new THREE.Matrix4();
const esquina = new THREE.Vector3();
const escala = new THREE.Vector3();

/**
 * Extremos del producto en el mundo para la pose actual.
 * `separacion` es lo que se han alejado las piezas en la vista explosionada,
 * medido sobre el eje local X (el de las copas), que es por donde se abre.
 */
export function extremosProducto(stage: StageState, separacion: number, out: Extremos): Extremos {
  euler.set(stage.rotX, stage.rotY, stage.rotZ);
  matriz.makeRotationFromEuler(euler);
  escala.setScalar(stage.scale);
  matriz.scale(escala);

  // La explosión ensancha la caja local antes de rotarla.
  const ex = separacion;
  const ey = Math.max(EXPLODE.band[1], EXPLODE.bandPad[1]) * (separacion > 0 ? 1 : 0);
  const minX = cajaLocal.min.x - ex;
  const maxX = cajaLocal.max.x + ex;
  const minY = cajaLocal.min.y;
  const maxY = cajaLocal.max.y + ey;

  out.minX = Infinity;
  out.maxX = -Infinity;
  out.minY = Infinity;
  out.maxY = -Infinity;

  for (let i = 0; i < 8; i++) {
    esquina
      .set(
        i & 1 ? maxX : minX,
        i & 2 ? maxY : minY,
        i & 4 ? cajaLocal.max.z : cajaLocal.min.z,
      )
      .applyMatrix4(matriz);
    const x = esquina.x + stage.posX;
    const y = esquina.y + stage.posY;
    if (x < out.minX) out.minX = x;
    if (x > out.maxX) out.maxX = x;
    if (y < out.minY) out.minY = y;
    if (y > out.maxY) out.maxY = y;
  }

  return out;
}
