/** Navegación fija, con la sección activa marcada y desplazamiento nativo. */

const ENLACES = [
  { id: 'producto', texto: 'Producto' },
  { id: 'relato', texto: 'Anatomía' },
  { id: 'sonido', texto: 'Sonido' },
  { id: 'acabados', texto: 'Acabados' },
  { id: 'cierre', texto: 'Cierre' },
];

export function Nav({ activa }: { activa: string }) {
  return (
    <header className="nav">
      <a className="nav__marca" href="#entrada">
        VÓRTICE
      </a>
      <nav aria-label="Secciones">
        <ul className="nav__lista">
          {ENLACES.map((e) => (
            <li key={e.id}>
              <a href={`#${e.id}`} aria-current={activa === e.id ? 'true' : undefined}>
                {e.texto}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
