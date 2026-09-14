/**
 * Control para pausar el movimiento automático.
 *
 * Afecta a la respiración del producto, al giro lento, al campo de ondas y al
 * grano. El desplazamiento y el arrastre siguen funcionando: son movimiento
 * que provoca el propio visitante.
 *
 * Si el sistema ya pide menos movimiento, no hay nada que pausar: el control
 * lo explica en vez de ofrecer una acción que no haría nada.
 */

import { useMotion } from '../hooks/useMotion';

export function MotionToggle() {
  const { paused, reduced, togglePaused } = useMotion();

  if (reduced) {
    return (
      <p className="control control--nota" data-estado="pausado">
        <span className="control__icono" aria-hidden="true">
          <i />
          <i />
        </span>
        <span className="control__texto">
          Movimiento detenido por tu sistema
        </span>
      </p>
    );
  }

  return (
    <button
      type="button"
      className="control"
      data-estado={paused ? 'pausado' : 'activo'}
      aria-pressed={paused}
      onClick={togglePaused}
    >
      <span className="control__icono" aria-hidden="true">
        <i />
        <i />
      </span>
      <span className="control__texto">
        {paused ? 'Reanudar movimiento' : 'Pausar movimiento'}
      </span>
    </button>
  );
}
