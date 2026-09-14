/**
 * Superficie de depuración de la escena.
 *
 * Una pieza con esta cantidad de movimiento es difícil de verificar a ojo, así
 * que la escena publica su estado para que los scripts de `scripts/` puedan
 * comprobar encuadres, poses e interacción sin depender de capturas.
 *
 * Sólo se activa en desarrollo o cuando la página se abre con `window.__debug`
 * puesto antes de cargar (lo hace el arnés de pruebas). En producción las
 * funciones no llegan a registrarse.
 */

import * as THREE from 'three';

type Ventana = Window & {
  __debug?: boolean;
  __stageDebug?: () => unknown;
  __medirProducto?: () => unknown;
};

export const depuracionActiva = () =>
  import.meta.env.DEV || (typeof window !== 'undefined' && (window as Ventana).__debug === true);

export function publicarEstado(datos: () => unknown) {
  (window as Ventana).__stageDebug = datos;
}

const caja = new THREE.Box3();
const punto = new THREE.Vector3();

/** Caja del producto proyectada a píxeles: detecta recortes reales. */
export function publicarMedida(
  objeto: THREE.Object3D,
  camara: THREE.Camera,
  ancho: number,
  alto: number,
) {
  (window as Ventana).__medirProducto = () => {
    caja.setFromObject(objeto);
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (let i = 0; i < 8; i++) {
      punto
        .set(
          i & 1 ? caja.max.x : caja.min.x,
          i & 2 ? caja.max.y : caja.min.y,
          i & 4 ? caja.max.z : caja.min.z,
        )
        .project(camara);
      const px = (punto.x * 0.5 + 0.5) * ancho;
      const py = (-punto.y * 0.5 + 0.5) * alto;
      minX = Math.min(minX, px);
      maxX = Math.max(maxX, px);
      minY = Math.min(minY, py);
      maxY = Math.max(maxY, py);
    }
    return {
      mundo: {
        alto: +(caja.max.y - caja.min.y).toFixed(3),
        ancho: +(caja.max.x - caja.min.x).toFixed(3),
      },
      pantalla: {
        x: Math.round(minX),
        y: Math.round(minY),
        w: Math.round(maxX - minX),
        h: Math.round(maxY - minY),
      },
      viewport: { w: ancho, h: alto },
    };
  };
}
