/**
 * 2 · Producto interactivo.
 *
 * La capa de arrastre se superpone a la escena 3D. En táctil conserva el
 * desplazamiento vertical de la página: sólo el gesto horizontal gira el
 * producto.
 */

import { Lineas, Reveal, retardo } from '../components/Reveal';
import { useProductDrag } from '../hooks/useProductDrag';
import { Velo } from '../components/Velo';

export function Producto() {
  const { dragging, moved, reset, handlers } = useProductDrag();

  return (
    <section className="escena producto" id="producto" data-escena="producto" data-beat="producto">
      <div className="escena__interior fijo">
        <Velo direccion="izq" />
        <div className="rejilla">
        <div className="producto__texto" data-reveal style={retardo(0)}>
          <p className="etiqueta">
            <span>01 · En tus manos</span>
          </p>

          <Lineas
            className="titular titular--medio"
            lineas={['Gíralo.', 'Míralo de cerca.']}
            paso={100}
          />

          <p className="entradilla aparece" style={retardo(340)}>
            Arrastra sobre el producto para girarlo. Con el teclado, usa las flechas;
            la tecla <kbd>Inicio</kbd> devuelve la vista original.
          </p>

          <div className="producto__acciones aparece" style={retardo(430)}>
            <button type="button" className="boton" onClick={reset} disabled={!moved}>
              <span className="boton__punto" aria-hidden="true" />
              Restablecer vista
            </button>
          </div>

          <dl className="producto__ficha aparece" style={retardo(520)}>
            <div>
              <dt>Arco</dt>
              <dd>Aluminio mecanizado</dd>
            </div>
            <div>
              <dt>Copas</dt>
              <dd>Cardán de dos ejes</dd>
            </div>
            <div>
              <dt>Almohadillas</dt>
              <dd>Espuma viscoelástica</dd>
            </div>
            <div>
              <dt>Peso declarado</dt>
              <dd>286 g</dd>
            </div>
          </dl>
        </div>

        {/* Capa de manipulación: no tapa el texto y deja pasar el scroll vertical */}
        <div
          className="manipulador"
          data-arrastrando={dragging ? 'si' : 'no'}
          role="application"
          tabIndex={0}
          aria-label="Vista del producto en tres dimensiones. Arrastra o usa las flechas del teclado para girarlo."
          {...handlers}
        >
          <p className="manipulador__pista" style={{ opacity: dragging ? 0 : 1 }}>
            {moved ? 'Sigue girando · Inicio para restablecer' : 'Arrastra para girar'}
          </p>
        </div>

          <Reveal delay={0} className="solo-lectores">
            <p>
              El producto se muestra en una escena tridimensional interactiva. Toda la
              información descrita aquí está disponible también en texto.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
