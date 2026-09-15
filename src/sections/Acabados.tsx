/**
 * 5 · Selector de acabados.
 *
 * Tres botones cambian los materiales del producto, el nombre de la variante y
 * el acento de toda la escena. El estado seleccionado se marca con
 * `aria-pressed` y con contraste, no sólo con color.
 */

import { Lineas, retardo } from '../components/Reveal';
import { FINISHES, finishById, type FinishId } from '../config/finishes';
import { Velo } from '../components/Velo';

export function Acabados({
  finish,
  onChange,
}: {
  finish: FinishId;
  onChange: (id: FinishId) => void;
}) {
  const actual = finishById(finish);

  return (
    <section className="escena acabados" id="acabados" data-escena="acabados" data-beat="acabados">
      <div className="escena__interior fijo">
        <Velo direccion="der" />
        <div className="rejilla">
        <div className="acabados__texto" data-reveal>
          <p className="etiqueta">
            <span>07 · Acabados</span>
          </p>

          <Lineas className="titular titular--pequeno" lineas={['Tres pieles.']} paso={90} />

          <h3 className="acabados__nombre aparece" style={retardo(240)}>
            {/* La clave fuerza la reanimación al cambiar de variante */}
            <span key={actual.id}>{actual.name}</span>
          </h3>

          <ul className="acabados__lista aparece" style={retardo(320)}>
            {FINISHES.map((f) => (
              <li key={f.id}>
                <button
                  type="button"
                  className="muestra"
                  aria-pressed={f.id === finish}
                  onClick={() => onChange(f.id)}
                >
                  <span
                    className="muestra__disco"
                    style={{ background: f.swatch }}
                    aria-hidden="true"
                  />
                  {f.name}
                </button>
              </li>
            ))}
          </ul>

          <div className="acabados__detalle aparece" style={retardo(400)}>
            <p className="nota" key={`${actual.id}-code`}>
              {actual.code}
            </p>
            <p className="entradilla" key={`${actual.id}-blurb`}>
              {actual.blurb}
            </p>
          </div>
          </div>
        </div>
      </div>
    </section>
  );
}
