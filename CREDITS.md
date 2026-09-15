# Créditos y procedencia

## Material de referencia consultado

Se revisó el repositorio público
[`asgeirtj/system_prompts_leaks`](https://github.com/asgeirtj/system_prompts_leaks),
carpeta `Anthropic/claude-design`, en concreto:

- `skills/frontend-design/SKILL.md`
- `skills/hi-fi-design/SKILL.md`
- `skills/3d-object/SKILL.md`
- `starter-components/animations-v3.jsx`
- `starter-components/three-d-stage.js`

**Licencia comprobada:** el repositorio se publica bajo
[CC0 1.0 Universal](https://creativecommons.org/publicdomain/zero/1.0/)
(dominio público), lo que permite reutilizar y adaptar su contenido sin
condiciones.

### Qué se ha tomado y qué no

Ese material depende de un entorno propietario que **aquí no existe**:
herramientas como `copy_starter_component` o `show_html`, el formato de
documento `.dc.html` con su bloque `<helmet>`, y un mapa de importación fijado
que carga three.js desde `unpkg` con hashes de integridad. Nada de eso se ha
usado. Tampoco se ha copiado ningún texto de instrucciones como indicación del
sistema: los documentos se leyeron como criterio de diseño, no como órdenes.

Lo que sí se ha reutilizado, reescrito para este proyecto:

| Origen | Aquí | Naturaleza |
| --- | --- | --- |
| `animations-v3.jsx` → `Easing`, `interpolate`, `animate`, `clamp` | `src/lib/easing.ts` | Adaptado a TypeScript, recortado a lo que usa la demo y ampliado con `damp` y `smoothstep`. Se indica la procedencia en la cabecera del archivo. |
| `animations-v3.jsx` → idea de composición continua (un solo árbol de elementos como función pura de un eje temporal) | `src/scroll/beats.ts` + `src/config/choreography.ts` | Reimplementación propia sobre el desplazamiento de la página en lugar de un reloj de reproducción. |
| `three-d-stage.js` → receta de iluminación de estudio (hemisférica + clave + relleno, sin mapa de entorno descargado) | `src/three/StudioEnvironment.tsx` y las luces de `src/three/Scene.tsx` | Reimplementado con `PMREMGenerator` y paneles emisivos propios, sin dependencias externas. |
| `3d-object/SKILL.md` → modelar con primitivas nombradas, materiales contados, paleta corta, ojo a la silueta | `src/three/Headphones.tsx`, `src/three/geometry.ts` | Criterio de modelado; el modelo es original. |
| `frontend-design/SKILL.md` → dirección estética (tipografía con carácter, color dominante con acento, composición asimétrica, atmósfera antes que color plano) | `src/styles/global.css` | Criterio de diseño. |
| `hi-fi-design/SKILL.md` → proceso (partir del contexto, documentar supuestos, verificar con capturas e iterar) | Método de trabajo | Criterio de proceso. |

**No se ha copiado** ningún fragmento de `three-d-stage.js` ni de los
componentes React de `animations-v3.jsx`: el visor, la barra de reproducción,
los exportadores OBJ/GLB y el kit de acuarela no tienen función en esta pieza.

## Dependencias

Todas se instalan desde npm y se empaquetan en el sitio; no hay peticiones a
servicios externos en tiempo de ejecución.

| Paquete | Licencia |
| --- | --- |
| `react`, `react-dom` | MIT |
| `three` | MIT |
| `@react-three/fiber` | MIT |
| `gsap` (núcleo y ScrollTrigger) | [GreenSock estándar, sin coste](https://gsap.com/community/standard-license/) |
| `vite`, `@vitejs/plugin-react`, `typescript` | MIT / Apache-2.0 |
| `@fontsource/bodoni-moda` | Tipografía bajo SIL Open Font License 1.1 |
| `@fontsource/space-grotesk` | Tipografía bajo SIL Open Font License 1.1 |
| `@fontsource/space-mono` | Tipografía bajo SIL Open Font License 1.1 |

## Recursos gráficos

No hay imágenes, modelos ni sonidos descargados. Todo lo que se ve está
generado por código:

- Los auriculares son geometría procedural (`LatheGeometry`, toros, cajas,
  cilindros y esferas) construida en `src/three/Headphones.tsx`.
- El mapa de entorno se hornea en el navegador a partir de paneles emisivos.
- Halos, charcos de luz y rótulos de pieza se dibujan en lienzos 2D.
- El grano y el icono del sitio son SVG en línea.
- La ilustración alternativa sin WebGL es SVG escrito a mano.

## Sobre la marca

**VÓRTICE es una marca ficticia**, creada para esta demostración de diseño de
CodeCraft. El producto, la serie VTX, los acabados y las características son
inventados. No hay testimonios, premios ni resultados comerciales: nada de eso
se ha inventado ni insinuado. La página no vende, no recoge datos y no se
conecta a ningún servicio.
