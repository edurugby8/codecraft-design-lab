/**
 * Etiquetas de pieza dibujadas en un lienzo 2D y usadas como textura.
 *
 * Se dibujan con las tipografías de la página, así que la etiqueta 3D y la
 * interfaz comparten el mismo estilo editorial. Al usar `THREE.Sprite` las
 * etiquetas siempre miran a la cámara aunque el producto gire.
 */

import * as THREE from 'three';

export const LABEL_W = 640;
export const LABEL_H = 190;

export type LabelSide = 'izq' | 'der';

export function drawLabel(
  canvas: HTMLCanvasElement,
  { code, title, accent, side }: { code: string; title: string; accent: string; side: LabelSide },
) {
  const dpr = Math.min(2, typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1);
  canvas.width = LABEL_W * dpr;
  canvas.height = LABEL_H * dpr;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, LABEL_W, LABEL_H);

  const right = side === 'der';
  const x = right ? 26 : LABEL_W - 26;
  ctx.textAlign = right ? 'left' : 'right';
  ctx.textBaseline = 'alphabetic';

  // Punto de acento
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.arc(right ? 32 : LABEL_W - 32, 34, 6, 0, Math.PI * 2);
  ctx.fill();

  // Código
  ctx.font = '500 24px "Space Mono", ui-monospace, monospace';
  ctx.fillStyle = accent;
  ctx.fillText(code.toUpperCase(), right ? x + 26 : x - 26, 42);

  // Título
  ctx.font = '500 44px "Space Grotesk", system-ui, sans-serif';
  ctx.fillStyle = 'rgba(242, 237, 228, 0.95)';
  ctx.fillText(title, x, 104);

  // Filete
  ctx.strokeStyle = 'rgba(242, 237, 228, 0.32)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(right ? 26 : LABEL_W - 26, 130);
  ctx.lineTo(right ? LABEL_W - 60 : 60, 130);
  ctx.stroke();
}

export function makeLabelTexture(opts: {
  code: string;
  title: string;
  accent: string;
  side: LabelSide;
}) {
  const canvas = document.createElement('canvas');
  drawLabel(canvas, opts);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  texture.needsUpdate = true;

  // Las tipografías pueden llegar después del primer dibujo: repite entonces.
  if (typeof document !== 'undefined' && document.fonts?.ready) {
    document.fonts.ready
      .then(() => {
        drawLabel(canvas, opts);
        texture.needsUpdate = true;
      })
      .catch(() => {});
  }

  return { texture, canvas };
}
