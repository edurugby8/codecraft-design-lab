/**
 * 3 · Historia al hacer scroll.
 *
 * Cuatro escenas enlazadas dentro de una misma sección: el producto se acerca
 * y cambia de orientación, las piezas se separan, aparecen las etiquetas y
 * todo vuelve a reunirse. Cada paso es un bloque alto del documento; no se
 * fija nada con `pin` ni se secuestra la rueda.
 */

import { Lineas, retardo } from '../components/Reveal';
import { PARTS } from '../config/parts';
import { Velo } from '../components/Velo';

export function Relato() {
  return (
    <section className="escena relato" id="relato" data-escena="relato">
      <div className="escena__interior relato__pasos">
        {/* 3.1 · Se acerca */}
        <article className="paso paso--izq" data-beat="relato1" data-reveal>
          <div className="fijo">
            <Velo direccion="izq" />
            <div className="paso__caja">
            <p className="etiqueta">
              <span>02 · Anatomía</span>
            </p>
            <Lineas
              className="titular titular--pequeno"
              lineas={['Un objeto', 'de once piezas.']}
              paso={95}
            />
            <p className="entradilla aparece" style={retardo(300)}>
              Ninguna se ve por casualidad. El arco, el cardán y la copa forman una sola
              línea continua que no se interrumpe en ningún punto de apoyo.
            </p>
            </div>
          </div>
        </article>

        {/* 3.2 · Se separa */}
        <article className="paso paso--der" data-beat="relato2" data-reveal>
          <div className="fijo">
            <Velo direccion="der" />
            <div className="paso__caja">
            <p className="etiqueta">
              <span>03 · Despiece</span>
            </p>
            <Lineas
              className="titular titular--pequeno"
              lineas={['Se abre', 'por capas.']}
              paso={95}
            />
            <p className="entradilla aparece" style={retardo(300)}>
              Cada copa se desmonta en cinco capas: aro exterior, placa, carcasa,
              transductor y almohadilla. La espuma se cambia sin herramientas.
            </p>
            </div>
          </div>
        </article>

        {/* 3.3 · Etiquetas */}
        <article className="paso paso--centro" data-beat="relato3" data-reveal>
          <div className="fijo fijo--abajo">
            <Velo direccion="abajo" />
            <div className="paso__caja">
            <p className="etiqueta etiqueta--suelta">
              <span>04 · Piezas</span>
            </p>
            <Lineas className="titular titular--pequeno" lineas={['Nombre a nombre.']} paso={90} />
            <ul className="piezas">
              {PARTS.map((p) => (
                <li key={p.code}>
                  <b>{p.code}</b>
                  <span>
                    <strong>{p.title}</strong>
                    <span>{p.note}</span>
                  </span>
                </li>
              ))}
            </ul>
            </div>
          </div>
        </article>

        {/* 3.4 · Se reúne */}
        <article className="paso paso--izq" data-beat="relato4" data-reveal>
          <div className="fijo">
            <Velo direccion="izq" />
            <div className="paso__caja">
            <p className="etiqueta">
              <span>05 · Montaje</span>
            </p>
            <Lineas
              className="titular titular--pequeno"
              lineas={['Y vuelve', 'a cerrarse.']}
              paso={95}
            />
            <p className="entradilla aparece" style={retardo(300)}>
              Las once piezas encajan en una carcasa sellada. Desde fuera, sólo se ve el
              filete de acento recorriendo el arco.
            </p>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
