/**
 * Materiales del producto, con transición suave entre acabados.
 *
 * Se crean una sola vez y se mutan; cambiar de acabado interpola los colores
 * en lugar de reconstruir la escena, de modo que la transición se ve y no
 * parpadea.
 */

import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { finishById, type FinishId } from '../config/finishes';
import { UI } from '../config/choreography';
import { smoothstep } from '../lib/easing';
import type { QualityTier } from '../lib/quality';

export type ProductMaterials = {
  shell: THREE.MeshStandardMaterial;
  metal: THREE.MeshStandardMaterial;
  pad: THREE.MeshStandardMaterial;
  grille: THREE.MeshStandardMaterial;
  accent: THREE.MeshStandardMaterial;
  accentGlow: THREE.MeshStandardMaterial;
};

export function useFinishMaterials(finish: FinishId, tier: QualityTier): ProductMaterials {
  const materials = useMemo<ProductMaterials>(() => {
    const f = finishById(finish).materials;
    const flat = tier === 'bajo';
    return {
      shell: new THREE.MeshStandardMaterial({
        name: 'carcasa',
        color: new THREE.Color(f.shell),
        roughness: 0.62,
        metalness: 0.12,
        flatShading: false,
        envMapIntensity: flat ? 0.5 : 0.9,
      }),
      metal: new THREE.MeshStandardMaterial({
        name: 'metal',
        color: new THREE.Color(f.metal),
        roughness: f.roughness,
        metalness: f.metalness,
        envMapIntensity: flat ? 0.7 : 1.35,
      }),
      pad: new THREE.MeshStandardMaterial({
        name: 'almohadilla',
        color: new THREE.Color(f.pad),
        roughness: 0.94,
        metalness: 0.0,
        envMapIntensity: 0.35,
      }),
      grille: new THREE.MeshStandardMaterial({
        name: 'rejilla',
        color: new THREE.Color(f.grille),
        roughness: 0.5,
        metalness: 0.45,
        envMapIntensity: 0.7,
      }),
      accent: new THREE.MeshStandardMaterial({
        name: 'acento',
        color: new THREE.Color(f.accent),
        roughness: 0.38,
        metalness: 0.3,
        envMapIntensity: 1,
      }),
      accentGlow: new THREE.MeshStandardMaterial({
        name: 'acento-emisivo',
        color: new THREE.Color(f.accent),
        emissive: new THREE.Color(f.accent),
        emissiveIntensity: 1.1,
        roughness: 0.4,
        metalness: 0,
        toneMapped: false,
      }),
      // eslint-disable-next-line react-hooks/exhaustive-deps
    };
    // Sólo el nivel de calidad reconstruye los materiales; el acabado se
    // interpola en el efecto de abajo.
  }, [tier]); // eslint-disable-line react-hooks/exhaustive-deps

  const from = useRef<Record<string, THREE.Color>>({});
  const target = useRef(finishById(finish));
  const mix = useRef(1);

  useEffect(() => {
    const next = finishById(finish);
    if (next.id === target.current.id && mix.current === 1) {
      // Primer montaje: aplica de golpe.
    }
    from.current = {
      shell: materials.shell.color.clone(),
      metal: materials.metal.color.clone(),
      pad: materials.pad.color.clone(),
      grille: materials.grille.color.clone(),
      accent: materials.accent.color.clone(),
    };
    target.current = next;
    mix.current = 0;
  }, [finish, materials]);

  const tmp = useMemo(() => new THREE.Color(), []);

  useFrame((_, delta) => {
    if (mix.current >= 1) return;
    mix.current = Math.min(1, mix.current + delta / (UI.finishSwap / 1000));
    // Curva suave para que el cambio de acabado «asiente» en vez de saltar.
    const t = smoothstep(0, 1, mix.current);
    const f = target.current.materials;

    const apply = (mat: THREE.MeshStandardMaterial, key: string, hex: string) => {
      const start = from.current[key];
      if (!start) {
        mat.color.set(hex);
        return;
      }
      mat.color.copy(start).lerp(tmp.set(hex), t);
    };

    apply(materials.shell, 'shell', f.shell);
    apply(materials.metal, 'metal', f.metal);
    apply(materials.pad, 'pad', f.pad);
    apply(materials.grille, 'grille', f.grille);
    apply(materials.accent, 'accent', f.accent);
    materials.accentGlow.color.copy(materials.accent.color);
    materials.accentGlow.emissive.copy(materials.accent.color);
    materials.metal.metalness = f.metalness;
    materials.metal.roughness = f.roughness;
  });

  useEffect(
    () => () => {
      Object.values(materials).forEach((m) => m.dispose());
    },
    [materials],
  );

  return materials;
}
