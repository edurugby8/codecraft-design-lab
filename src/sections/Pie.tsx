/** Pie: identifica la pieza como demostración de diseño, sin promesas comerciales. */

export function Pie() {
  return (
    <footer className="pie">
      <div className="pie__interior">
        <div>
          <p className="etiqueta etiqueta--suelta" style={{ marginBottom: '0.8rem' }}>
            CodeCraft · Laboratorio de diseño
          </p>
          <p className="pie__aviso">
            VÓRTICE es una marca ficticia creada para esta demostración de diseño web. El
            producto, los nombres y las características son inventados: no hay venta, ni
            recogida de datos, ni integraciones comerciales de ningún tipo.
          </p>
        </div>
        <div>
          <p className="nota">
            Escena 3D construida con geometría procedural.
            <br />
            Tipografías Bodoni Moda, Space Grotesk y Space Mono.
          </p>
        </div>
      </div>
    </footer>
  );
}
