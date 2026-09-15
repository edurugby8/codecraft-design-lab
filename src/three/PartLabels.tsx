/**
 * Etiquetas de la vista explosionada.
 *
 * Los rótulos se dibujan en un lienzo 2D y viven en sprites (siempre miran a
 * la cámara aunque el producto gire). Las columnas se separan según el ancho
 * visible, de modo que en pantallas estrechas siguen cabiendo.
 */

import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PARTS } from '../config/parts';
import { makeLabelTexture, LABEL_W, LABEL_H } from './labelTexture';
import { stage } from '../lib/stageState';
import { smoothstep } from '../lib/easing';
import { ANCHO_ETIQUETAS_3D } from '../config/choreography';

const LABEL_WIDTH = 1.55;
const LABEL_HEIGHT = (LABEL_WIDTH * LABEL_H) / LABEL_W;

export function PartLabels({ accent, modelRef }: { accent: string; modelRef: React.RefObject<THREE.Group | null> }) {
  const groupRef = useRef<THREE.Group>(null);
  const spriteRefs = useRef<(THREE.Sprite | null)[]>([]);
  const linesRef = useRef<THREE.LineSegments>(null);

  const sprites = useMemo(
    () =>
      PARTS.map((p) => {
        const { texture } = makeLabelTexture({
          code: p.code,
          title: p.title,
          accent,
          side: p.column === 'der' ? 'der' : 'izq',
        });
        const material = new THREE.SpriteMaterial({
          map: texture,
          transparent: true,
          depthTest: false,
          depthWrite: false,
          opacity: 0,
        });
        return { part: p, texture, material };
      }),
    [accent],
  );

  useEffect(
    () => () => {
      sprites.forEach((s) => {
        s.texture.dispose();
        s.material.dispose();
      });
    },
    [sprites],
  );

  const lineGeometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(PARTS.length * 6), 3));
    return g;
  }, []);

  const lineMaterial = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: new THREE.Color(accent),
        transparent: true,
        opacity: 0,
        depthTest: false,
      }),
    [accent],
  );

  useEffect(
    () => () => {
      lineGeometry.dispose();
      lineMaterial.dispose();
    },
    [lineGeometry, lineMaterial],
  );

  const anchorWorld = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ camera, size }) => {
    const group = groupRef.current;
    if (!group) return;

    // Las etiquetas esperan a que el despiece esté hecho: aparecer a la vez
    // que las piezas se separan se leía como ruido.
    const visible = THREE.MathUtils.clamp((stage.labels - 0.4) / 0.6, 0, 1);
    group.visible = visible > 0.005 && size.width > ANCHO_ETIQUETAS_3D;
    if (!group.visible) return;

    const cam = camera as THREE.PerspectiveCamera;
    const halfW =
      Math.abs(cam.position.z - 0) * Math.tan((cam.fov * Math.PI) / 360) * (size.width / size.height);
    const columnX = THREE.MathUtils.clamp(halfW - LABEL_WIDTH * 0.62, 1.5, 3.3);

    const model = modelRef.current;
    const positions = lineGeometry.getAttribute('position') as THREE.BufferAttribute;

    sprites.forEach(({ part, material }, i) => {
      const sprite = spriteRefs.current[i];
      if (!sprite) return;

      const dir = part.column === 'der' ? 1 : -1;
      // Entrada escalonada: las etiquetas no aparecen todas a la vez.
      const eased = smoothstep(0, 0.55, visible - i * 0.06);

      material.opacity = eased;
      sprite.position.set(
        dir * (columnX - (1 - eased) * 0.35),
        part.y,
        0.6,
      );
      sprite.scale.set(LABEL_WIDTH, LABEL_HEIGHT, 1);

      // Ancla en el modelo (sigue a la pieza cuando se separa)
      anchorWorld.set(
        part.anchor[0] + part.anchorSpread * stage.explode * Math.sign(part.anchor[0] || 1),
        part.anchor[1],
        part.anchor[2],
      );
      if (model) anchorWorld.applyMatrix4(model.matrixWorld);

      const tipX = dir * (columnX - LABEL_WIDTH * 0.5);
      positions.setXYZ(i * 2, tipX, part.y - LABEL_HEIGHT * 0.18, 0.6);
      positions.setXYZ(
        i * 2 + 1,
        THREE.MathUtils.lerp(tipX, anchorWorld.x, eased),
        THREE.MathUtils.lerp(part.y - LABEL_HEIGHT * 0.18, anchorWorld.y, eased),
        THREE.MathUtils.lerp(0.6, anchorWorld.z, eased),
      );
    });

    positions.needsUpdate = true;
    lineMaterial.opacity = visible * 0.5;
  });

  return (
    <group ref={groupRef} name="etiquetas" visible={false}>
      {sprites.map(({ part, material }, i) => (
        <sprite
          key={part.code}
          ref={(el) => {
            spriteRefs.current[i] = el;
          }}
          material={material}
          renderOrder={10}
        />
      ))}
      <lineSegments ref={linesRef} geometry={lineGeometry} material={lineMaterial} renderOrder={9} />
    </group>
  );
}
