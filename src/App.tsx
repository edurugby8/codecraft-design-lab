/**
 * VÓRTICE — landing de lanzamiento.
 * Demostración de diseño de CodeCraft. Marca y producto ficticios.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Nav } from './components/Nav';
import { Cursor } from './components/Cursor';
import { MotionToggle } from './components/MotionToggle';
import { SinWebGL } from './components/SinWebGL';
import { Stage } from './three/Stage';

import { Entrada } from './sections/Entrada';
import { Producto } from './sections/Producto';
import { Relato } from './sections/Relato';
import { Sonido } from './sections/Sonido';
import { Acabados } from './sections/Acabados';
import { Detalles } from './sections/Detalles';
import { Cierre } from './sections/Cierre';
import { Pie } from './sections/Pie';

import { createChoreography } from './scroll/choreographer';
import { detectCapabilities } from './lib/quality';
import { lanzarEntrada, resetStage } from './lib/stageState';
import { POSES } from './config/choreography';
import { DEFAULT_FINISH, finishById, type FinishId } from './config/finishes';
import { useMotion } from './hooks/useMotion';

export default function App() {
  const caps = useMemo(detectCapabilities, []);
  const { reduced, still } = useMotion();
  const [finish, setFinish] = useState<FinishId>(DEFAULT_FINISH);
  const [seccion, setSeccion] = useState('entrada');
  const introDone = useRef(false);

  // El acento del acabado tiñe toda la interfaz.
  useEffect(() => {
    const f = finishById(finish);
    document.documentElement.style.setProperty('--acento', f.accent);
    document.documentElement.style.setProperty('--acento-suave', f.accentSoft);
  }, [finish]);

  // Coreografía del desplazamiento
  useEffect(() => {
    const choreo = createChoreography({ reduced, onSection: setSeccion });
    const onResize = () => choreo.refresh();
    window.addEventListener('resize', onResize);
    // Las tipografías cambian la altura de los titulares: recalcular al cargar.
    document.fonts?.ready.then(() => choreo.refresh()).catch(() => {});
    return () => {
      window.removeEventListener('resize', onResize);
      choreo.destroy();
    };
  }, [reduced]);

  // Entrada: la marca aparece, se revela el titular y el producto entra girando.
  // No hay pantalla de carga: el contenido está desde el primer fotograma.
  const reproducirEntrada = useCallback((inmediata: boolean) => {
    const texto = document.getElementById('entrada-texto');
    if (texto) texto.classList.add('esta-visible');

    lanzarEntrada(inmediata);
  }, []);

  useEffect(() => {
    if (introDone.current) return;
    introDone.current = true;
    reproducirEntrada(reduced);
  }, [reduced, reproducirEntrada]);

  // «Volver a explorar»: vuelve arriba y repite la entrada.
  const reiniciar = useCallback(() => {
    const destino = document.getElementById('entrada');
    destino?.scrollIntoView({ behavior: still ? 'auto' : 'smooth', block: 'start' });

    const arrancar = () => {
      resetStage(POSES.intro);
      reproducirEntrada(still);
    };

    if (still) {
      arrancar();
      return;
    }
    // Espera a que el desplazamiento suave llegue arriba antes de repetir la
    // entrada, para que las dos animaciones no se pisen.
    let intentos = 0;
    const esperar = () => {
      if (window.scrollY < 4 || intentos > 120) {
        arrancar();
        return;
      }
      intentos += 1;
      requestAnimationFrame(esperar);
    };
    requestAnimationFrame(esperar);
  }, [reproducirEntrada, still]);

  return (
    <>
      <a className="saltar" href="#contenido">
        Saltar al contenido
      </a>

      {caps.webgl ? <Stage finish={finish} caps={caps} saltar={reduced} /> : <SinWebGL finish={finish} />}

      <div className="grano" aria-hidden="true" />
      <div className="vineta" aria-hidden="true" />
      <div className="avance" aria-hidden="true" />

      <Nav activa={seccion} />
      <Cursor />

      <div className="controles">
        <MotionToggle />
      </div>

      <main className="contenido" id="contenido">
        <Entrada />
        <Producto />
        <Relato />
        <Sonido />
        <Acabados finish={finish} onChange={setFinish} />
        <Detalles />
        <Cierre onReiniciar={reiniciar} />
      </main>

      <Pie />
    </>
  );
}
