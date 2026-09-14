/**
 * 7 · Cierre.
 *
 * El producto vuelve a la composición completa y el botón «Volver a explorar»
 * devuelve la página y la escena a su estado inicial.
 */

import { Lineas, retardo } from '../components/Reveal';
import { Velo } from '../components/Velo';

export function Cierre({ onReiniciar }: { onReiniciar: () => void }) {
  return (
    <section className="escena cierre" id="cierre" data-escena="cierre" data-beat="cierre">
      <div className="escena__interior cierre__fijo" data-reveal>
        <Velo direccion="centro" />
        <p className="etiqueta etiqueta--suelta">
          <span>10 · VÓRTICE VTX</span>
        </p>

        <Lineas className="titular" lineas={['Tu mundo.', 'Otra frecuencia.']} paso={120} />

        <p className="entradilla aparece" style={retardo(420)} >
          Has recorrido el producto de arriba abajo. Puedes volver al principio y hacerlo
          otra vez con otro acabado.
        </p>

        <div className="cierre__acciones aparece" style={retardo(520)}>
          <button type="button" className="boton boton--solido" onClick={onReiniciar}>
            <span className="boton__punto" aria-hidden="true" />
            Volver a explorar
          </button>
          <a className="boton" href="#acabados">
            Cambiar de acabado
          </a>
        </div>
      </div>
    </section>
  );
}
