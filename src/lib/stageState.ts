/**
 * Estado mutable compartido entre el DOM (GSAP/ScrollTrigger) y el bucle de
 * render 3D. Es un objeto plano: GSAP lo interpola y `useFrame` lo lee, de
 * modo que el desplazamiento no provoca renderizados de React.
 */

import { POSES, type StagePose } from '../config/choreography';

/** Claves interpolables de la pose (las que suaviza el bucle de render). */
export const POSE_KEYS = Object.keys(POSES.intro) as (keyof StagePose)[];

export type StageState = StagePose & {
  /** Puntero normalizado (-1..1) */
  pointerX: number;
  pointerY: number;
  /** Puntero suavizado, el que usa la escena */
  smoothX: number;
  smoothY: number;
  /** Rotación añadida por arrastre del usuario */
  dragY: number;
  dragX: number;
  /** Velocidad residual del arrastre */
  velY: number;
  velX: number;
  /** 1 mientras la escena de producto está activa (permite arrastrar) */
  interactive: number;
  /** Progreso global 0..1 del documento */
  progress: number;
  /** Progreso 0..1 dentro de la escena de sonido */
  soundProgress: number;
  /** 0 = sin movimiento automático */
  motion: number;
  /** 1 cuando el lienzo está visible en pantalla */
  visible: number;
  /** Progreso de la animación de entrada (0..1), derivado del reloj real */
  intro: number;
  /** Marca de tiempo en la que arrancó la entrada (performance.now) */
  introStart: number;
};

export const stage: StageState = {
  ...POSES.intro,
  pointerX: 0,
  pointerY: 0,
  smoothX: 0,
  smoothY: 0,
  dragY: 0,
  dragX: 0,
  velY: 0,
  velX: 0,
  interactive: 0,
  progress: 0,
  soundProgress: 0,
  motion: 1,
  visible: 1,
  intro: 0,
  introStart: 0,
};

/**
 * Arranca la secuencia de entrada. Se mide con el reloj real, no con el bucle
 * de animación: en un equipo lento la entrada sigue durando lo mismo en vez de
 * estirarse hasta perder el sentido.
 */
export function lanzarEntrada(inmediata: boolean) {
  stage.intro = inmediata ? 1 : 0;
  stage.introStart = inmediata ? 0 : performance.now();
}

/**
 * Pose objetivo. La coreografía del scroll escribe aquí y el bucle de render
 * lleva `stage` hacia este valor con suavizado exponencial: el resultado es
 * idéntico al avanzar y al retroceder, y nunca da saltos.
 */
export const poseTarget: StagePose = { ...POSES.intro };

/** Velocidad del suavizado (mayor = más inmediato). */
export const smoothing = { lambda: 6.5 };

/** Restablece el estado a una pose concreta (usado por «Volver a explorar»). */
export function resetStage(pose: StagePose = POSES.intro) {
  Object.assign(stage, pose);
  Object.assign(poseTarget, pose);
  stage.dragY = 0;
  stage.dragX = 0;
  stage.velY = 0;
  stage.velX = 0;
}
