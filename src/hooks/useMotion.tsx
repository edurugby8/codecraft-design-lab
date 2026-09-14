/**
 * Preferencias de movimiento.
 *
 * `reduced`  — el sistema pide menos movimiento (prefers-reduced-motion).
 * `paused`   — el visitante ha pausado el movimiento automático con el control
 *              de la interfaz. Se recuerda en localStorage.
 * `still`    — cualquiera de las dos: la escena se queda quieta salvo lo que
 *              el propio visitante mueva (scroll, arrastre).
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { stage } from '../lib/stageState';

const STORAGE_KEY = 'vortice:movimiento';

type MotionValue = {
  reduced: boolean;
  paused: boolean;
  still: boolean;
  togglePaused: () => void;
};

const MotionContext = createContext<MotionValue>({
  reduced: false,
  paused: false,
  still: false,
  togglePaused: () => {},
});

export function MotionProvider({ children }: { children: ReactNode }) {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  });

  const [paused, setPaused] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      return window.localStorage.getItem(STORAGE_KEY) === 'pausado';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const still = reduced || paused;

  useEffect(() => {
    stage.motion = still ? 0 : 1;
    const root = document.documentElement;
    root.dataset.movimiento = still ? 'quieto' : 'activo';
    root.dataset.reducido = reduced ? 'si' : 'no';
  }, [still, reduced]);

  const togglePaused = useCallback(() => {
    setPaused((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(STORAGE_KEY, next ? 'pausado' : 'activo');
      } catch {
        /* almacenamiento no disponible: la preferencia dura la sesión */
      }
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ reduced, paused, still, togglePaused }),
    [reduced, paused, still, togglePaused],
  );

  return <MotionContext.Provider value={value}>{children}</MotionContext.Provider>;
}

export const useMotion = () => useContext(MotionContext);
