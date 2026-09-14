/**
 * Detección de capacidades del dispositivo.
 *
 * Define un nivel de calidad que reduce partículas, resolución, sombras y
 * segmentos de geometría en equipos modestos, y detecta si WebGL está
 * disponible para poder ofrecer una alternativa visual.
 */

export type QualityTier = 'alto' | 'medio' | 'bajo';

export type Capabilities = {
  webgl: boolean;
  tier: QualityTier;
  /** Límite de devicePixelRatio para el renderizador */
  dpr: [number, number];
  shadows: boolean;
  /** Segmentos radiales de las superficies curvas */
  segments: number;
  /** Activa el suelo reflectante */
  floor: boolean;
  /** Puntero fino (ratón/trackpad) disponible */
  finePointer: boolean;
};

let cached: Capabilities | null = null;

function detectWebGL(): boolean {
  if (typeof document === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl2') ??
      canvas.getContext('webgl') ??
      canvas.getContext('experimental-webgl');
    if (!gl) return false;
    // Libera el contexto de prueba: los navegadores limitan cuántos hay vivos.
    const lose = (gl as WebGLRenderingContext).getExtension('WEBGL_lose_context');
    lose?.loseContext();
    return true;
  } catch {
    return false;
  }
}

export function detectCapabilities(): Capabilities {
  if (cached) return cached;

  const webgl = detectWebGL();
  const nav = typeof navigator !== 'undefined' ? navigator : undefined;
  const cores = nav?.hardwareConcurrency ?? 4;
  const memory = (nav as unknown as { deviceMemory?: number })?.deviceMemory ?? 4;
  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
  const width = typeof window !== 'undefined' ? window.innerWidth : 1280;
  const coarse =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(pointer: coarse)').matches === true;
  const finePointer =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(hover: hover) and (pointer: fine)').matches === true;

  let tier: QualityTier = 'alto';
  if (cores <= 4 || memory <= 4 || (coarse && width < 820)) tier = 'medio';
  if (cores <= 2 || memory <= 2 || width < 420) tier = 'bajo';
  // Pantallas muy densas en equipos modestos: baja un escalón.
  if (dpr > 2.5 && tier === 'alto') tier = 'medio';

  cached = {
    webgl,
    tier,
    dpr: tier === 'alto' ? [1, 2] : tier === 'medio' ? [1, 1.6] : [1, 1.2],
    shadows: tier === 'alto',
    segments: tier === 'alto' ? 64 : tier === 'medio' ? 40 : 24,
    floor: tier !== 'bajo',
    finePointer,
  };
  return cached;
}
