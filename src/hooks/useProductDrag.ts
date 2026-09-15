/**
 * Arrastre del producto.
 *
 * Se engancha a una capa del DOM colocada sobre la escena de producto, no al
 * lienzo: así el resto de la página conserva la selección de texto y el
 * desplazamiento nativo.
 *
 * En táctil, `touch-action: pan-y` deja pasar el desplazamiento vertical de la
 * página; sólo el gesto horizontal gira el producto.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { DRAG } from '../config/choreography';
import { stage } from '../lib/stageState';

export function useProductDrag() {
  const [dragging, setDragging] = useState(false);
  const [moved, setMoved] = useState(false);
  const last = useRef<{ x: number; y: number; id: number } | null>(null);
  const resetRef = useRef<number | null>(null);

  const stop = useCallback(() => {
    last.current = null;
    setDragging(false);
  }, []);

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    last.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
    stage.velY = 0;
    stage.velX = 0;
    if (resetRef.current) {
      cancelAnimationFrame(resetRef.current);
      resetRef.current = null;
    }
    setDragging(true);
    // No se captura el puntero en táctil: el navegador debe seguir pudiendo
    // desplazar la página verticalmente.
    if (e.pointerType === 'mouse') e.currentTarget.setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLElement>) => {
    const l = last.current;
    if (!l || l.id !== e.pointerId) return;
    const dx = e.clientX - l.x;
    const dy = e.clientY - l.y;
    last.current = { x: e.clientX, y: e.clientY, id: e.pointerId };

    const rotY = dx * DRAG.sensitivityX;
    stage.dragY += rotY;
    stage.velY = rotY * 0.6;

    // El giro vertical sólo se aplica con ratón: en táctil el gesto vertical
    // pertenece a la página.
    if (e.pointerType === 'mouse') {
      const rotX = dy * DRAG.sensitivityY;
      stage.dragX = Math.max(-DRAG.maxPitch, Math.min(DRAG.maxPitch, stage.dragX + rotX));
      stage.velX = rotX * 0.6;
    }
    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) setMoved(true);
  }, []);

  const reset = useCallback(() => {
    stage.velY = 0;
    stage.velX = 0;
    const t0 = performance.now();
    const fromY = stage.dragY;
    const fromX = stage.dragX;
    const step = (now: number) => {
      const t = Math.min(1, (now - t0) / 700);
      const e = 1 - Math.pow(1 - t, 3);
      stage.dragY = fromY * (1 - e);
      stage.dragX = fromX * (1 - e);
      if (t < 1) resetRef.current = requestAnimationFrame(step);
      else {
        resetRef.current = null;
        setMoved(false);
      }
    };
    resetRef.current = requestAnimationFrame(step);
  }, []);

  /** Giro con teclado, para quien no use puntero. */
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLElement>) => {
      const stepSize = e.shiftKey ? 0.4 : 0.16;
      if (e.key === 'ArrowLeft') {
        stage.dragY -= stepSize;
        setMoved(true);
      } else if (e.key === 'ArrowRight') {
        stage.dragY += stepSize;
        setMoved(true);
      } else if (e.key === 'ArrowUp') {
        stage.dragX = Math.max(-DRAG.maxPitch, stage.dragX - stepSize * 0.5);
        setMoved(true);
      } else if (e.key === 'ArrowDown') {
        stage.dragX = Math.min(DRAG.maxPitch, stage.dragX + stepSize * 0.5);
        setMoved(true);
      } else if (e.key === 'Home' || e.key === '0') {
        reset();
      } else {
        return;
      }
      e.preventDefault();
    },
    [reset],
  );

  useEffect(
    () => () => {
      if (resetRef.current) cancelAnimationFrame(resetRef.current);
    },
    [],
  );

  return {
    dragging,
    moved,
    reset,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: stop,
      onPointerCancel: stop,
      onPointerLeave: stop,
      onKeyDown,
    },
  };
}
