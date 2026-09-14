/**
 * Coreografía del desplazamiento.
 *
 * La pose de la escena 3D NO se maneja aquí: se calcula en el bucle de render
 * como función pura del scroll (ver `beats.ts`), que es lo que garantiza que
 * ir y volver recorran la misma curva. ScrollTrigger se reserva para lo que
 * hace bien: revelar texto una sola vez, la barra de avance y saber qué
 * sección está a la vista.
 *
 * No se secuestra la rueda ni se fija nada con `pin`: las escenas largas usan
 * `position: sticky`, que respeta el desplazamiento nativo del navegador.
 */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { medirTiempos } from './beats';
import { stage } from '../lib/stageState';
import { smoothing } from '../lib/stageState';

gsap.registerPlugin(ScrollTrigger);

export type ChoreographyOptions = {
  reduced: boolean;
  onSection?: (id: string) => void;
};

export function createChoreography({ reduced, onSection }: ChoreographyOptions) {
  const triggers: ScrollTrigger[] = [];

  smoothing.lambda = reduced ? 40 : 6.5;
  medirTiempos();

  // Avance global (barra superior)
  triggers.push(
    ScrollTrigger.create({
      trigger: document.documentElement,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        stage.progress = self.progress;
        document.documentElement.style.setProperty('--avance', String(self.progress));
      },
    }),
  );

  // Sección visible, para marcar el enlace activo de la navegación
  if (onSection) {
    document.querySelectorAll<HTMLElement>('[data-escena]').forEach((el) => {
      triggers.push(
        ScrollTrigger.create({
          trigger: el,
          start: 'top 50%',
          end: 'bottom 50%',
          onToggle: (self) => {
            if (self.isActive) onSection(el.dataset.escena ?? '');
          },
        }),
      );
    });
  }

  // Revelado del texto por líneas
  gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
    if (reduced) {
      el.classList.add('esta-visible');
      return;
    }
    triggers.push(
      ScrollTrigger.create({
        trigger: el,
        start: 'top 88%',
        once: true,
        onEnter: () => el.classList.add('esta-visible'),
      }),
    );
  });

  // Las medidas de los tiempos dependen de la maquetación: rehacerlas en cada
  // recálculo de ScrollTrigger (redimensionado, carga de tipografías…).
  const alRefrescar = () => medirTiempos();
  ScrollTrigger.addEventListener('refresh', alRefrescar);
  ScrollTrigger.refresh();

  return {
    refresh: () => ScrollTrigger.refresh(),
    destroy: () => {
      ScrollTrigger.removeEventListener('refresh', alRefrescar);
      triggers.forEach((t) => t.kill());
      ScrollTrigger.getAll().forEach((t) => t.kill());
    },
  };
}
