/**
 * 4 · Sonido convertido en imagen.
 *
 * La retícula de barras responde al cursor y al avance del desplazamiento.
 * Es una representación visual: no mide ningún sonido ni reproduce audio.
 */

import { Lineas, retardo } from '../components/Reveal';
import { Velo } from '../components/Velo';

export function Sonido() {
  return (
    <section className="escena sonido" id="sonido" data-escena="sonido" data-beat="sonido">
      <div className="escena__interior sonido__fijo">
        <Velo direccion="izq" />
        <Velo direccion="abajo" />
        <div className="sonido__cabecera" data-reveal>
          <p className="etiqueta">
            <span>06 · Campo</span>
          </p>
          <Lineas
            className="titular titular--medio"
            lineas={['El sonido,', 'dibujado.']}
            paso={100}
          />
          <p className="entradilla aparece" style={retardo(320)}>
            Mueve el cursor sobre la escena: la retícula se levanta a su paso. Al seguir
            bajando, la onda recorre el campo de lado a lado.
          </p>
        </div>

        <div className="sonido__pie" data-reveal>
          <p className="nota sonido__leyenda aparece">
            Representación visual, no una medición. Esta demostración no reproduce audio
            ni activa el sonido por su cuenta.
          </p>
          <p className="nota aparece" style={retardo(120)}>
            Retícula adaptativa · se reduce en equipos modestos
          </p>
        </div>
      </div>
    </section>
  );
}
