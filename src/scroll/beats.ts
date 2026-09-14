/**
 * Tiempos de la coreografía, resueltos a partir del desplazamiento.
 *
 * En vez de encadenar callbacks, se mide una vez dónde empieza y acaba cada
 * transición y después la pose se calcula como una función pura del scroll.
 * Así avanzar y retroceder recorren exactamente la misma curva, un salto
 * brusco de posición (un ancla, `scrollTo`, recargar a media página) aterriza
 * en la pose correcta, y no hay estado acumulado que pueda desincronizarse.
 */

import { POSES, type PoseName, type StagePose } from '../config/choreography';
import { POSE_KEYS } from '../lib/stageState';
import { clamp, Easing } from '../lib/easing';

/** Orden de los tiempos y elemento que dispara cada uno. */
const BEATS: { name: PoseName; selector: string | null }[] = [
  { name: 'intro', selector: null },
  { name: 'producto', selector: '[data-beat="producto"]' },
  { name: 'relato1', selector: '[data-beat="relato1"]' },
  { name: 'relato2', selector: '[data-beat="relato2"]' },
  { name: 'relato3', selector: '[data-beat="relato3"]' },
  { name: 'relato4', selector: '[data-beat="relato4"]' },
  { name: 'sonido', selector: '[data-beat="sonido"]' },
  { name: 'acabados', selector: '[data-beat="acabados"]' },
  { name: 'detalle1', selector: '[data-beat="detalle1"]' },
  { name: 'detalle2', selector: '[data-beat="detalle2"]' },
  { name: 'cierre', selector: '[data-beat="cierre"]' },
];

/**
 * La transición ocupa desde que el bloque asoma por abajo hasta que su borde
 * superior alcanza el de la pantalla, que es justo cuando su bloque `sticky`
 * se engancha y el texto de la escena queda centrado. Así el final del
 * movimiento de cámara coincide con la composición definitiva de la escena.
 */
const INICIO = 1.0; // borde inferior del viewport
const FIN = 0.02; // prácticamente el borde superior

type Segmento = { from: StagePose; to: StagePose; start: number; end: number };

let segmentos: Segmento[] = [];
let rangoSonido: { start: number; end: number } | null = null;
let rangoProducto: { start: number; end: number } | null = null;

/** Mide las posiciones de los tiempos. Hay que rellamarla al redimensionar. */
export function medirTiempos() {
  const vh = window.innerHeight;
  const nuevos: Segmento[] = [];

  for (let i = 1; i < BEATS.length; i++) {
    const beat = BEATS[i];
    if (!beat.selector) continue;
    const el = document.querySelector<HTMLElement>(beat.selector);
    if (!el) continue;

    const top = el.getBoundingClientRect().top + window.scrollY;
    const start = top - vh * INICIO;
    const end = top - vh * FIN;
    nuevos.push({
      from: POSES[BEATS[i - 1].name],
      to: POSES[beat.name],
      start,
      end: Math.max(end, start + 1),
    });
  }

  segmentos = nuevos;

  const medirSeccion = (selector: string) => {
    const el = document.querySelector<HTMLElement>(selector);
    if (!el) return null;
    const top = el.getBoundingClientRect().top + window.scrollY;
    return { start: top - vh, end: top + el.offsetHeight };
  };
  rangoSonido = medirSeccion('[data-escena="sonido"]');
  rangoProducto = medirSeccion('[data-beat="producto"]');
}

/**
 * Escribe en `out` la pose correspondiente a un desplazamiento dado.
 * `saltar` (movimiento reducido) corta en seco en lugar de interpolar: se
 * adopta la composición de cada tiempo sin recorrido intermedio.
 */
export function poseEnScroll(y: number, out: StagePose, saltar = false) {
  let activo: Segmento | null = null;
  let ultimoPasado: Segmento | null = null;

  for (const seg of segmentos) {
    if (y >= seg.end) {
      ultimoPasado = seg;
    } else if (y > seg.start) {
      activo = seg;
      break;
    } else {
      break;
    }
  }

  if (activo) {
    const bruto = clamp((y - activo.start) / (activo.end - activo.start));
    const t = saltar ? (bruto < 0.5 ? 0 : 1) : Easing.easeInOutQuad(bruto);
    for (const k of POSE_KEYS) {
      out[k] = activo.from[k] + (activo.to[k] - activo.from[k]) * t;
    }
    return;
  }

  const pose = ultimoPasado ? ultimoPasado.to : POSES.intro;
  for (const k of POSE_KEYS) out[k] = pose[k];
}

/** Avance 0..1 dentro de la escena de sonido, para que la onda siga al scroll. */
export function progresoSonido(y: number) {
  if (!rangoSonido) return 0;
  return clamp((y - rangoSonido.start) / Math.max(1, rangoSonido.end - rangoSonido.start));
}

/** 1 mientras la escena de producto está en pantalla (permite arrastrar). */
export function productoActivo(y: number) {
  if (!rangoProducto) return 0;
  return y > rangoProducto.start && y < rangoProducto.end ? 1 : 0;
}
