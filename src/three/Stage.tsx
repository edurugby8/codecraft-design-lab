/**
 * Lienzo persistente.
 *
 * Está fijo detrás del documento y no captura eventos: la página se desplaza
 * y se selecciona con normalidad. La interacción con el producto llega desde
 * una capa del DOM en la sección correspondiente.
 */

import { Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Scene } from './Scene';
import { stage } from '../lib/stageState';
import type { Capabilities } from '../lib/quality';
import type { FinishId } from '../config/finishes';

export function Stage({
  finish,
  caps,
  saltar,
}: {
  finish: FinishId;
  caps: Capabilities;
  saltar: boolean;
}) {
  const [running, setRunning] = useState(true);

  // Cuando la pestaña no está a la vista se detiene el bucle por completo.
  useEffect(() => {
    const onVisibility = () => {
      const visible = !document.hidden;
      stage.visible = visible ? 1 : 0;
      setRunning(visible);
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  // Puntero global: alimenta el paralaje y el campo de ondas.
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      stage.pointerX = (e.clientX / window.innerWidth) * 2 - 1;
      stage.pointerY = (e.clientY / window.innerHeight) * 2 - 1;
    };
    const onLeave = () => {
      stage.pointerX = 0;
      stage.pointerY = 0;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerleave', onLeave);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  return (
    <div className="lienzo" aria-hidden="true">
      <Canvas
        frameloop={running ? 'always' : 'never'}
        dpr={caps.dpr}
        shadows={false}
        gl={{
          antialias: caps.tier !== 'bajo',
          powerPreference: 'high-performance',
          alpha: true,
        }}
        camera={{ position: [0, 0, 5.4], fov: 38, near: 0.1, far: 80 }}
      >
        <Suspense fallback={null}>
          <Scene finish={finish} caps={caps} saltar={saltar} />
        </Suspense>
      </Canvas>
    </div>
  );
}
