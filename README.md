# VÓRTICE

Página de lanzamiento en 3D. Demostración de diseño de **CodeCraft**.

Una landing para **VÓRTICE**, una marca **ficticia** de auriculares de alta
gama, construida como pieza inmersiva de una sola toma. El producto es un
modelo 3D procedural que acompaña al visitante de principio a fin, cambiando de
composición entre escenas: entra, se deja girar, se despieza sobre el relato,
se convierte en onda, cambia de acabado y se despide.

> VÓRTICE no existe. El producto, los acabados y las características son
> inventados para esta demostración de diseño de CodeCraft. No hay tienda, ni
> formularios, ni seguimiento, ni integraciones comerciales. No se inventan
> testimonios, premios ni resultados de negocio.

### Puesta en marcha

```bash
npm install
npm run dev        # desarrollo
npm run build      # compila a dist/
npm run preview    # sirve dist/ en localhost:4173
```

Comprobaciones (necesitan `npm run preview` en otra terminal y, la primera vez,
`npx playwright install chromium`; si el entorno ya trae el navegador en otra
ruta, pásala en `CHROMIUM`):

```bash
npm run pruebas               # recorrido funcional en 4 escenarios
npm run capturas -- desktop   # capturas de todas las escenas
npm run capturas -- mobile
REDUCED=1 npm run capturas -- desktop
```

### El recorrido

| # | Escena | Qué ocurre |
| --- | --- | --- |
| 1 | Entrada | Aparece la marca, se revela «Escucha lo que viene.» línea a línea y los auriculares entran girando desde fuera de cuadro. Sin pantalla de carga: el contenido está desde el primer fotograma. |
| 2 | Producto | Arrastra para girarlo, flechas del teclado, «Restablecer vista». En táctil el gesto vertical sigue desplazando la página. |
| 3 | Anatomía | Cuatro escenas enlazadas: el producto se acerca y cambia de orientación, se separa en vista explosionada, aparecen las etiquetas sobre las piezas y todo se reúne. |
| 4 | Sonido | Una retícula de barras responde al cursor y al avance del scroll. Representación visual, no una medición: no se reproduce audio. |
| 5 | Acabados | Tres botones cambian los materiales del producto, el nombre de la variante y el acento de toda la página. |
| 6 | Detalles | Dos primeros planos con revelado por líneas y cambios de escala coordinados. Baja el pulso entre dos momentos intensos. |
| 7 | Cierre | El producto vuelve a la composición completa con «Tu mundo. Otra frecuencia.» y «Volver a explorar», que devuelve la página y la escena a su estado inicial. |

### Cómo está montado

**Una sola escena 3D persistente.** Un único `<canvas>` fijo detrás del
documento, sin capturar eventos: la página se desplaza y se selecciona con
normalidad. No hay un lienzo por sección.

**La pose es una función pura del scroll.** `src/scroll/beats.ts` mide una vez
dónde empieza y acaba cada transición y después calcula la pose a partir de la
posición de desplazamiento. No hay estado acumulado, así que retroceder deshace
exactamente lo que hizo avanzar y un salto brusco (un ancla, recargar a media
página) aterriza donde debe. El bucle de render lleva la escena hacia esa pose
con suavizado exponencial, independiente del framerate.

**Los valores de animación están centralizados.** Todas las poses, tiempos,
amplitudes y sensibilidades viven en `src/config/choreography.ts`; los acabados
en `src/config/finishes.ts`; las medidas del modelo en `src/three/geometry.ts`.

**Nada de `pin` ni de secuestro de la rueda.** Las escenas largas usan
`position: sticky`. GSAP/ScrollTrigger sólo se encarga de revelar texto, la
barra de avance y saber qué sección está a la vista.

**Encuadre automático.** `src/three/bounds.ts` mide la caja real del producto al
montarlo y la transforma analíticamente cada fotograma. Las poses que deben
mostrarlo entero (`fit: 1`) retroceden lo necesario para que no se recorte en
ninguna proporción de pantalla; los primeros planos (`fit: 0`) recortan a
propósito.

**El modelo es procedural.** Arco, acolchado, varillas, cardanes, carcasas,
placas, rejillas, transductores y almohadillas construidos con primitivas
nombradas en `src/three/Headphones.tsx`. No hay modelos descargados, así que no
hay dudas de licencia. La vista explosionada desplaza cada pieza por el eje de
su copa: explotar y reunir son la misma curva en sentidos opuestos.

**Iluminación sin descargas.** El mapa de entorno se hornea en el navegador con
`PMREMGenerator` a partir de paneles emisivos (`StudioEnvironment.tsx`), más una
luz clave que viaja con la cámara para que el producto esté modelado gire como
gire.

### Rendimiento y accesibilidad

- **Tres niveles de calidad** según núcleos, memoria y densidad de pantalla:
  ajustan resolución de render, segmentos de geometría, tamaño del mapa de
  entorno, antialiasing y densidad de la retícula de ondas (de 46×26 a 22×12).
- **Se detiene lo que no se ve.** El bucle de render para cuando la pestaña se
  oculta; el campo de ondas no calcula nada fuera de su escena.
- **`prefers-reduced-motion`.** Sin entrada animada, sin respiración ni giro
  automático, sin revelados: cada escena adopta su composición sin recorrido
  intermedio y todo el contenido está visible.
- **Control para pausar el movimiento**, con estado recordado. Detiene lo
  automático; el scroll y el arrastre, que son del visitante, siguen.
- **Alternativa sin WebGL:** ilustración SVG del producto y aviso; el resto de
  la página funciona igual.
- Navegación por teclado en toda la interfaz, foco visible, enlace para saltar
  al contenido, el producto girable con flechas y `Inicio` para restablecer.
- El cursor decorativo es sólo de escritorio con puntero fino, no captura
  eventos y nunca sustituye al del sistema.
- En vertical el producto tiene su propia franja superior y el texto vive
  debajo, sobre fondo limpio.

### Dirección visual

Negro (`#0a0a0b`) y marfil (`#f2ede4`) con naranja eléctrico (`#ff4d0a`) como
acento, que cambia con el acabado elegido. Bodoni Moda para los titulares
editoriales, Space Grotesk para el texto y Space Mono para las etiquetas
pequeñas. Composición asimétrica, contraste alto y espacio alrededor del
producto.

### Estructura

```
src/
  config/        poses y tiempos, acabados, piezas etiquetadas
  lib/           easing, estado de escena, detección de capacidades
  scroll/        medición de tiempos y coreografía
  three/         modelo, escena, materiales, ondas, etiquetas, encuadre
  components/    navegación, velo, cursor, control de movimiento, alternativa SVG
  sections/      las siete escenas
  styles/        hoja de estilo única
scripts/         capturas y pruebas con Playwright
```

Procedencia del material de referencia, licencias y dependencias:
[`CREDITS.md`](./CREDITS.md).
