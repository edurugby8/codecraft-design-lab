/**
 * Puntero decorativo. Sólo en escritorio con puntero fino, nunca oculta el
 * cursor del sistema y no captura eventos: es un adorno que acompaña, no un
 * sustituto.
 */

import { useEffect, useRef } from 'react';
import { useMotion } from '../hooks/useMotion';
import { detectCapabilities } from '../lib/quality';

export function Cursor() {
  const ref = useRef<HTMLDivElement>(null);
  const { still } = useMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || still || !detectCapabilities().finePointer) return;

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let cx = x;
    let cy = y;
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      x = e.clientX;
      y = e.clientY;
      el.dataset.activo = 'si';
      const objetivo = (e.target as HTMLElement | null)?.closest(
        'a, button, .manipulador, [role="button"]',
      );
      el.dataset.sobre = objetivo ? 'si' : 'no';
    };
    const onLeave = () => {
      el.dataset.activo = 'no';
    };

    const loop = () => {
      cx += (x - cx) * 0.18;
      cy += (y - cy) * 0.18;
      el.style.transform = `translate3d(${cx.toFixed(1)}px, ${cy.toFixed(1)}px, 0)`;
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);
    raf = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
      cancelAnimationFrame(raf);
    };
  }, [still]);

  if (still) return null;
  return <div className="puntero" ref={ref} data-activo="no" aria-hidden="true" />;
}
