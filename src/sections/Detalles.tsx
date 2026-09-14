/**
 * 6 · Detalles.
 *
 * Dos primeros planos con revelado por líneas y cambios de escala coordinados.
 * Entre las dos escenas intensas del relato y el cierre, este tramo baja el
 * pulso: menos elementos, más aire.
 */

import { Lineas, retardo } from '../components/Reveal';
import { Velo } from '../components/Velo';

export function Detalles() {
  return (
    <section className="escena detalles" id="detalles" data-escena="detalles">
      <div className="escena__interior">
        <article className="detalle detalle--uno" data-beat="detalle1">
          <div className="fijo">
            <Velo direccion="izq" />
            <div className="rejilla">
            <div className="detalle__texto" data-reveal>
              <p className="etiqueta">
                <span>08 · Copa</span>
              </p>
              <Lineas
                className="titular titular--pequeno"
                lineas={['El canto', 'es una línea', 'sin costura.']}
                paso={95}
              />
              <p className="entradilla aparece" style={retardo(340)}>
                El aro de acento recorre el perímetro de la copa a la misma altura en todo
                su trazado. Es la única pieza brillante de un objeto deliberadamente mate.
              </p>
              <span className="filete" style={retardo(420)} aria-hidden="true" />
            </div>
            </div>
          </div>
        </article>

        <article className="detalle detalle--dos" data-beat="detalle2">
          <div className="fijo">
            <Velo direccion="der" />
            <div className="rejilla">
            <div className="detalle__texto" data-reveal>
              <p className="etiqueta">
                <span>09 · Articulación</span>
              </p>
              <Lineas
                className="titular titular--pequeno"
                lineas={['Se mueve donde', 'tiene que moverse.']}
                paso={95}
              />
              <p className="entradilla aparece" style={retardo(340)}>
                La varilla se desliza dentro del arco y el cardán deja que la copa busque
                el ángulo de la cabeza. Nada cruje, nada asoma.
              </p>

              <div className="detalle__cifras aparece" style={retardo(440)}>
                <div className="detalle__cifra">
                  <p className="cifra">42</p>
                  <p className="nota">mm de transductor</p>
                </div>
                <div className="detalle__cifra">
                  <p className="cifra">2</p>
                  <p className="nota">ejes de cardán</p>
                </div>
                <div className="detalle__cifra">
                  <p className="cifra">286</p>
                  <p className="nota">gramos declarados</p>
                </div>
              </div>
            </div>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
