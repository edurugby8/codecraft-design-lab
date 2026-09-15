/**
 * Curvas de easing y ayudantes de interpolación.
 *
 * Adaptado de `starter-components/animations-v3.jsx` del repositorio público
 * asgeirtj/system_prompts_leaks (Anthropic/claude-design), publicado bajo
 * CC0 1.0 Universal (dominio público). Reescrito en TypeScript y reducido a
 * las funciones que esta demo necesita. Ver CREDITS.md.
 */

export type EasingFn = (t: number) => number;

export const Easing = {
  linear: (t: number) => t,

  /** Transición entre escenas: arranca y frena sin tirón. */
  easeInOutQuad: (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),

  /** Entrada del producto: rápido al principio, se posa al final. */
  easeOutCubic: (t: number) => 1 - Math.pow(1 - t, 3),

  easeInOutCubic: (t: number) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
} satisfies Record<string, EasingFn>;

export const clamp = (v: number, min = 0, max = 1) => Math.max(min, Math.min(max, v));

/** Tween de un solo tramo: devuelve `from` antes de `start` y `to` tras `end`. */
export function animate({
  from = 0,
  to = 1,
  start = 0,
  end = 1,
  ease = Easing.easeInOutCubic,
}: {
  from?: number;
  to?: number;
  start?: number;
  end?: number;
  ease?: EasingFn;
}): (t: number) => number {
  return (t: number) => {
    if (t <= start) return from;
    if (t >= end) return to;
    return from + (to - from) * ease((t - start) / (end - start));
  };
}

/** Interpolación lineal independiente del framerate (~exponencial). */
export function damp(current: number, target: number, lambda: number, dt: number) {
  return current + (target - current) * (1 - Math.exp(-lambda * dt));
}

/** Rampa suave entre dos umbrales (equivalente a smoothstep de GLSL). */
export const smoothstep = (edge0: number, edge1: number, x: number) => {
  const t = clamp((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
};
