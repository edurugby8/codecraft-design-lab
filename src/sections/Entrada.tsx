/** 1 · Entrada — la marca aparece, se revela el titular y el producto entra girando. */

import { Lineas, retardo } from '../components/Reveal';
import { Velo } from '../components/Velo';

export function Entrada() {
  return (
    <section className="escena entrada" id="entrada" data-escena="entrada">
      <Velo direccion="izq" />
      <div className="escena__interior rejilla">
        <div className="entrada__texto" data-reveal id="entrada-texto">
          <p className="etiqueta">
            <span className="linea__interior">VÓRTICE · Serie VTX</span>
          </p>

          <h1 className="marca-grande linea" style={retardo(60)}>
            <span className="linea__interior">VÓRTICE</span>
          </h1>

          <Lineas
            as="p"
            className="titular titular--medio"
            lineas={['Escucha lo que', 'viene.']}
            paso={110}
          />

          <p className="entradilla aparece" style={retardo(620)}>
            Auriculares de diadema con arco de aluminio, cardán flotante y transductores
            de 42 mm. Una pieza pensada para desaparecer en cuanto empieza a sonar.
          </p>

          <div className="entrada__acciones aparece" style={retardo(760)}>
            <a className="boton boton--solido" href="#producto">
              <span className="boton__punto" aria-hidden="true" />
              Explorar el producto
            </a>
            <a className="boton" href="#relato">
              Ver la anatomía
            </a>
          </div>
        </div>

        <div className="entrada__pie" data-reveal style={retardo(900)}>
          <span className="desliza aparece">
            <span className="desliza__linea" aria-hidden="true" />
            Desplázate
          </span>

          <p className="nota aparece entrada__meta" style={retardo(1000)}>
            Demostración de diseño
            <br />
            CodeCraft · Laboratorio
          </p>
        </div>
      </div>
    </section>
  );
}
