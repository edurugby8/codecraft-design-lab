/**
 * Velo de legibilidad.
 *
 * Un degradado suave entre el lienzo 3D y el texto. Mantiene la composición
 * asimétrica —el producto sigue pasando por detrás de la tipografía— pero
 * garantiza el contraste del texto sin recurrir a tarjetas ni cajas opacas.
 *
 * Vive dentro de la sección con `z-index: -1`: queda por encima del lienzo
 * (que está en otro contexto de apilamiento, más al fondo) y por debajo del
 * texto de la propia sección.
 */

export type Direccion = 'izq' | 'der' | 'centro' | 'abajo';

export function Velo({ direccion = 'izq' }: { direccion?: Direccion }) {
  return <span className={`velo velo--${direccion}`} aria-hidden="true" />;
}
