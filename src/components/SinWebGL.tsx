/**
 * Alternativa visual cuando WebGL no está disponible.
 *
 * Reproduce la silueta del producto en SVG, con el mismo lenguaje gráfico que
 * la escena 3D, para que la página conserve su protagonista y todo el
 * contenido siga siendo legible.
 */

import { finishById, type FinishId } from '../config/finishes';

export function SinWebGL({ finish }: { finish: FinishId }) {
  const f = finishById(finish);

  return (
    <>
      <div className="sin-webgl" aria-hidden="true">
        <svg viewBox="0 0 400 360" role="presentation">
          <defs>
            <linearGradient id="metal" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={f.materials.metal} stopOpacity="0.95" />
              <stop offset="55%" stopColor={f.materials.metal} stopOpacity="0.55" />
              <stop offset="100%" stopColor={f.materials.metal} stopOpacity="0.9" />
            </linearGradient>
            <radialGradient id="copa" cx="0.38" cy="0.3" r="0.85">
              <stop offset="0%" stopColor={f.materials.shell} stopOpacity="1" />
              <stop offset="100%" stopColor="#000" stopOpacity="0.95" />
            </radialGradient>
            <radialGradient id="halo" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0%" stopColor={f.accent} stopOpacity="0.4" />
              <stop offset="100%" stopColor={f.accent} stopOpacity="0" />
            </radialGradient>
          </defs>

          <circle cx="200" cy="190" r="170" fill="url(#halo)" />

          {/* Arco */}
          <path
            d="M 86 196 A 114 114 0 0 1 314 196"
            fill="none"
            stroke="url(#metal)"
            strokeWidth="17"
            strokeLinecap="round"
          />
          <path
            d="M 104 178 A 96 96 0 0 1 296 178"
            fill="none"
            stroke={f.materials.pad}
            strokeWidth="10"
            strokeLinecap="round"
            opacity="0.85"
          />
          <path
            d="M 86 196 A 114 114 0 0 1 314 196"
            fill="none"
            stroke={f.accent}
            strokeWidth="1.6"
            strokeLinecap="round"
            opacity="0.8"
          />

          {/* Varillas */}
          <rect x="78" y="190" width="16" height="52" rx="7" fill="url(#metal)" />
          <rect x="306" y="190" width="16" height="52" rx="7" fill="url(#metal)" />

          {[86, 314].map((cx) => (
            <g key={cx}>
              {/* Cardán */}
              <ellipse
                cx={cx}
                cy="272"
                rx="60"
                ry="66"
                fill="none"
                stroke="url(#metal)"
                strokeWidth="6"
              />
              {/* Copa */}
              <ellipse cx={cx} cy="272" rx="51" ry="58" fill="url(#copa)" />
              <ellipse
                cx={cx}
                cy="272"
                rx="51"
                ry="58"
                fill="none"
                stroke={f.accent}
                strokeWidth="1.8"
                opacity="0.9"
              />
              <ellipse
                cx={cx}
                cy="272"
                rx="31"
                ry="36"
                fill="none"
                stroke={f.materials.metal}
                strokeWidth="1.4"
                opacity="0.5"
              />
              {/* Marca */}
              <path
                d={`M ${cx - 11} 262 L ${cx} 284 L ${cx + 11} 262`}
                fill="none"
                stroke={f.accent}
                strokeWidth="3.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx={cx} cy="214" r="4.5" fill={f.accent} />
            </g>
          ))}
        </svg>
      </div>

      <p className="sin-webgl__aviso nota">
        Tu navegador no tiene WebGL disponible, así que mostramos el producto en una
        ilustración fija. El resto de la página funciona con normalidad.
      </p>
    </>
  );
}
