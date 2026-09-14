/**
 * Revelados de texto. El movimiento vive en el CSS; aquí sólo se marca la
 * estructura y el escalonado, de modo que con movimiento reducido el mismo
 * marcado se muestra completo y sin transiciones.
 */

import { createElement, type CSSProperties, type ElementType, type ReactNode } from 'react';

type Vars = CSSProperties & Record<'--retardo', string>;

export const retardo = (ms: number): Vars => ({ '--retardo': `${ms}ms` }) as Vars;

export function Reveal({
  children,
  delay = 0,
  as: Tag = 'div',
  className,
  id,
}: {
  children: ReactNode;
  delay?: number;
  as?: ElementType;
  className?: string;
  id?: string;
}) {
  return createElement(
    Tag,
    { 'data-reveal': true, id, className, style: retardo(delay) },
    children,
  );
}

/** Un titular que se revela línea a línea. */
export function Lineas({
  lineas,
  className = 'titular',
  paso = 90,
  as: Tag = 'h2',
}: {
  lineas: string[];
  className?: string;
  paso?: number;
  as?: ElementType;
}) {
  return createElement(
    Tag,
    { className },
    lineas.map((texto, i) => (
      <span className="linea" key={texto + i} style={retardo(i * paso)}>
        <span className="linea__interior">{texto}</span>
      </span>
    )),
  );
}
