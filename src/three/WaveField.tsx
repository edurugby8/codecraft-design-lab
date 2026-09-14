/**
 * «Sonido convertido en imagen».
 *
 * Una retícula de barras cuya altura responde al cursor y al avance del
 * desplazamiento. Es una representación visual: no mide ningún sonido real ni
 * activa audio.
 *
 * Rendimiento: una sola malla instanciada; la retícula se reduce en equipos
 * modestos y el bucle se detiene por completo cuando la escena no está a la
 * vista (`stage.waves` cercano a cero).
 */

import { useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { WAVES } from '../config/choreography';
import { stage } from '../lib/stageState';
import type { QualityTier } from '../lib/quality';

const dummy = new THREE.Object3D();
const color = new THREE.Color();

export function WaveField({ tier, accent }: { tier: QualityTier; accent: string }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const clockRef = useRef(0);
  const activeRef = useRef(false);

  const [cols, rows] = WAVES.grid[tier];
  const count = cols * rows;

  const positions = useMemo(() => {
    const out = new Float32Array(count * 2);
    let i = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        out[i++] = (c - (cols - 1) / 2) * WAVES.spacing;
        out[i++] = (r - (rows - 1) / 2) * WAVES.spacing;
      }
    }
    return out;
  }, [cols, rows, count]);

  const geometry = useMemo(() => {
    const g = new THREE.BoxGeometry(0.045, 1, 0.045);
    // El pivote pasa a la base: escalar en Y hace crecer la barra hacia arriba.
    g.translate(0, 0.5, 0);
    return g;
  }, []);

  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        toneMapped: false,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    [],
  );

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  const accentColor = useMemo(() => new THREE.Color(accent), [accent]);
  const base = useMemo(() => new THREE.Color('#f2ede4'), []);

  useFrame((_, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const amp = stage.waves;
    // Fuera de la escena de sonido no se calcula nada.
    if (amp < 0.01) {
      if (activeRef.current) {
        mesh.visible = false;
        activeRef.current = false;
      }
      return;
    }
    if (!activeRef.current) {
      mesh.visible = true;
      activeRef.current = true;
    }

    // El reloj sólo avanza si el movimiento automático está activo; con
    // movimiento reducido la figura queda quieta y la mueve el propio scroll.
    clockRef.current += delta * WAVES.speed * stage.motion * stage.visible;
    const t = clockRef.current + stage.soundProgress * 6;

    const px = stage.smoothX * 3.4;
    const pz = -stage.smoothY * 2.2;
    const radius2 = WAVES.pointerRadius * WAVES.pointerRadius;

    for (let i = 0; i < count; i++) {
      const x = positions[i * 2];
      const z = positions[i * 2 + 1];
      const d = Math.sqrt(x * x + z * z);

      // Onda radial que sale del centro (donde está el producto)
      let h = Math.sin(d * 1.7 - t * 1.6) * 0.5 + 0.5;
      // Segunda onda cruzada, para que el patrón no se lea repetitivo
      h *= 0.55 + 0.45 * (Math.sin(x * 0.8 + t * 0.7) * 0.5 + 0.5);
      // Atenuación hacia los bordes
      h *= Math.max(0, 1 - d / (cols * WAVES.spacing * 0.62));

      // Realce bajo el cursor
      const dx = x - px;
      const dz = z - pz;
      const near = Math.max(0, 1 - (dx * dx + dz * dz) / radius2);
      h += near * near * WAVES.pointerLift;

      const height = Math.max(0.012, h * WAVES.maxHeight * amp);

      dummy.position.set(x, 0, z);
      dummy.scale.set(1, height, 1);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);

      color.copy(base).lerp(accentColor, Math.min(1, h * 1.15));
      mesh.setColorAt(i, color);
    }

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      name="campo-de-ondas"
      args={[geometry, material, count]}
      position={[0, -1.55, 0]}
      visible={false}
      frustumCulled={false}
    />
  );
}
