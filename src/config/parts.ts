/**
 * Piezas etiquetadas de la vista explosionada.
 *
 * Ojo con `column`: en esta escena el producto se ve por detrás (rotY ≈ π),
 * de modo que la copa izquierda del producto queda a la derecha de la
 * pantalla. Las columnas están asignadas para que las guías no se crucen.
 *
 * La misma lista alimenta las etiquetas 3D y el listado en texto de la
 * sección, para que el contenido esté disponible aunque no haya WebGL o el
 * visitante prefiera menos movimiento.
 */

export type PartLabel = {
  code: string;
  title: string;
  note: string;
  /** Columna en la que se coloca la etiqueta 3D */
  column: 'izq' | 'der';
  /** Altura de la etiqueta en la columna (unidades de escena) */
  y: number;
  /** Punto de anclaje en el modelo: [x, y, z] base y factor de separación */
  anchor: [number, number, number];
  /** Desplazamiento del ancla al explotar, sobre el eje X del modelo */
  anchorSpread: number;
};

export const PARTS: PartLabel[] = [
  {
    code: '01',
    title: 'Arco de aluminio',
    note: 'Pieza única mecanizada, sin soldaduras a la vista.',
    column: 'izq',
    y: 1.35,
    anchor: [0.45, 0.92, 0],
    anchorSpread: 0,
  },
  {
    code: '02',
    title: 'Acolchado viscoelástico',
    note: 'Reparte la presión a lo largo de todo el arco.',
    column: 'der',
    y: 1.35,
    anchor: [-0.42, 0.82, 0],
    anchorSpread: 0,
  },
  {
    code: '03',
    title: 'Cardán flotante',
    note: 'Dos ejes de giro para que la copa se asiente sola.',
    column: 'izq',
    y: 0.2,
    anchor: [1.02, -0.4, 0],
    anchorSpread: 0.98,
  },
  {
    code: '04',
    title: 'Carcasa mate',
    note: 'Superficie sin brillo, cámara acústica sellada.',
    column: 'izq',
    y: -0.95,
    anchor: [1.02, -1.02, 0],
    anchorSpread: 0.15,
  },
  {
    code: '05',
    title: 'Transductor de 42 mm',
    note: 'Membrana ligera suspendida sobre un anillo metálico.',
    column: 'der',
    y: 0.2,
    anchor: [-1.02, -1.02, 0],
    anchorSpread: -0.22,
  },
  {
    code: '06',
    title: 'Almohadilla de espuma',
    note: 'Funda extraíble, sección ovalada para la oreja.',
    column: 'der',
    y: -0.95,
    anchor: [-1.02, -1.02, 0],
    anchorSpread: -0.58,
  },
];
