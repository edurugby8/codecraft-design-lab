/**
 * Entorno de estudio procedural.
 *
 * En lugar de descargar un HDRI, se monta una caja de luces (paneles emisivos)
 * y se convierte en mapa de entorno con PMREMGenerator. Así el metal tiene algo
 * que reflejar, no hay peticiones de red y la licencia del proyecto sigue
 * siendo la del propio código.
 *
 * El mapa se hornea una sola vez al montar: no cuesta nada por fotograma.
 */

import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

type Panel = {
  color: string;
  intensity: number;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number];
};

/** Caja de luces: clave cenital amplia, relleno frío, contraluz cálido y rebote. */
const PANELES: Panel[] = [
  { color: '#ffffff', intensity: 3.4, position: [0, 5.5, 1.5], rotation: [Math.PI / 2, 0, 0], scale: [11, 7] },
  { color: '#a9c0e4', intensity: 1.5, position: [-6, 1, 1], rotation: [0, Math.PI / 2, 0], scale: [9, 7] },
  { color: '#ffd9b4', intensity: 1.15, position: [6, 0.5, 1], rotation: [0, -Math.PI / 2, 0], scale: [9, 7] },
  { color: '#f2ede4', intensity: 1.9, position: [0, -4.5, 2.5], rotation: [-Math.PI / 2, 0, 0], scale: [7, 6] },
  { color: '#8fa4c8', intensity: 0.9, position: [0, 1, -7], rotation: [0, 0, 0], scale: [10, 8] },
];

export function StudioEnvironment() {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);

  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    pmrem.compileEquirectangularShader();

    const box = new THREE.Scene();
    box.background = new THREE.Color('#0a0a0b');

    const geo = new THREE.PlaneGeometry(1, 1);
    const materials: THREE.Material[] = [];

    for (const p of PANELES) {
      const mat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(p.color).multiplyScalar(p.intensity),
        side: THREE.DoubleSide,
        toneMapped: false,
      });
      materials.push(mat);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(...p.position);
      mesh.rotation.set(...p.rotation);
      mesh.scale.set(p.scale[0], p.scale[1], 1);
      box.add(mesh);
    }

    const target = pmrem.fromScene(box, 0.035, 0.1, 100);
    scene.environment = target.texture;

    return () => {
      scene.environment = null;
      target.dispose();
      pmrem.dispose();
      geo.dispose();
      materials.forEach((m) => m.dispose());
      box.clear();
    };
  }, [gl, scene]);

  return null;
}
