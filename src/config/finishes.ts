/**
 * Acabados del producto. Cada uno cambia los materiales del modelo, el color
 * de acento de la escena y el nombre de la variante.
 */

export type FinishId = 'onice' | 'marfil' | 'volt';

export type Finish = {
  id: FinishId;
  /** Nombre de la variante */
  name: string;
  /** Código corto para la etiqueta monoespaciada */
  code: string;
  /** Descripción breve de materiales */
  blurb: string;
  /** Muestra para el botón (CSS) */
  swatch: string;
  /** Acento de escena y de interfaz */
  accent: string;
  /** Acento suave, para halos y trazos */
  accentSoft: string;
  /** Materiales del modelo (hex) */
  materials: {
    /** Carcasa exterior de la copa, mate */
    shell: string;
    /** Metal de diadema, horquillas y aros */
    metal: string;
    metalness: number;
    roughness: number;
    /** Almohadillas y acolchado de la diadema */
    pad: string;
    /** Rejilla interior */
    grille: string;
    /** Detalles de acento (aro, logotipo, junta) */
    accent: string;
  };
};

export const FINISHES: Finish[] = [
  {
    id: 'onice',
    name: 'Ónice Mate',
    code: 'VTX·01',
    blurb: 'Aluminio anodizado negro, almohadillas de espuma viscoelástica.',
    swatch: 'linear-gradient(135deg, #23252a 0%, #0c0d10 55%, #3a3d45 100%)',
    accent: '#FF4D0A',
    accentSoft: '#ff8c4d',
    materials: {
      shell: '#1b1d21',
      metal: '#8e939c',
      metalness: 0.72,
      roughness: 0.34,
      pad: '#141518',
      grille: '#0a0b0d',
      accent: '#FF4D0A',
    },
  },
  {
    id: 'marfil',
    name: 'Marfil Sílice',
    code: 'VTX·02',
    blurb: 'Carcasa cerámica mate, horquillas de cobre cepillado.',
    swatch: 'linear-gradient(135deg, #f6f1e6 0%, #d8cbb5 50%, #b07a48 100%)',
    accent: '#C8763C',
    accentSoft: '#e0a473',
    materials: {
      shell: '#ece5d8',
      metal: '#c98b52',
      metalness: 0.66,
      roughness: 0.31,
      pad: '#cabfae',
      grille: '#6d6355',
      accent: '#B4632C',
    },
  },
  {
    id: 'volt',
    name: 'Naranja Volt',
    code: 'VTX·03',
    blurb: 'Grafito texturizado con juntas en naranja eléctrico.',
    swatch: 'linear-gradient(135deg, #FF6A1F 0%, #FF3D00 45%, #1a1a1c 100%)',
    accent: '#FF5A12',
    accentSoft: '#ffa15e',
    materials: {
      shell: '#2a2b2f',
      metal: '#c4c8cf',
      metalness: 0.8,
      roughness: 0.22,
      pad: '#1d1e21',
      grille: '#111214',
      accent: '#FF5A12',
    },
  },
];

export const DEFAULT_FINISH: FinishId = 'onice';

export const finishById = (id: FinishId): Finish =>
  FINISHES.find((f) => f.id === id) ?? FINISHES[0];
