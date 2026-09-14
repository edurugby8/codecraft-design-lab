/**
 * VÓRTICE — modelo procedural de auriculares de diadema.
 *
 * Construido con primitivas nombradas (lathe, toros, cajas, cilindros): arco,
 * acolchado, varillas de extensión, aros cardán, carcasas, placas, rejillas,
 * transductores y almohadillas. No hay ningún modelo descargado, así que no
 * hay dudas de licencia.
 *
 * La vista explosionada desplaza cada pieza a lo largo del eje local +Y de su
 * copa (que apunta hacia fuera en el mundo), de modo que explotar y reunir son
 * la misma curva recorrida en sentidos opuestos.
 */

import { useMemo, useRef, type RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { M, CUP_PROFILE, EXPLODE } from './geometry';
import { medirProducto } from './bounds';
import type { ProductMaterials } from './useFinishMaterials';
import { stage } from '../lib/stageState';
import type { Capabilities } from '../lib/quality';

type PartRef = RefObject<THREE.Object3D | null>;

type CupRefs = {
  yoke: PartRef;
  rim: PartRef;
  plate: PartRef;
  shell: PartRef;
  driver: PartRef;
  pad: PartRef;
};

function useCupRefs(): CupRefs {
  return {
    yoke: useRef<THREE.Object3D | null>(null),
    rim: useRef<THREE.Object3D | null>(null),
    plate: useRef<THREE.Object3D | null>(null),
    shell: useRef<THREE.Object3D | null>(null),
    driver: useRef<THREE.Object3D | null>(null),
    pad: useRef<THREE.Object3D | null>(null),
  };
}

/** Geometrías compartidas por ambas copas: se crean una vez. */
function useProductGeometries(segments: number) {
  return useMemo(() => {
    const seg = segments;
    const half = Math.max(12, Math.round(seg / 2));

    const cupShell = new THREE.LatheGeometry(
      CUP_PROFILE.map(([r, y]) => new THREE.Vector2(r, y)),
      seg,
    );
    cupShell.computeVertexNormals();

    const geos = {
      cupShell,
      band: new THREE.TorusGeometry(M.bandRadius, M.bandTube, Math.max(10, half / 2), seg, Math.PI),
      bandPad: new THREE.TorusGeometry(
        M.padBandRadius,
        M.padBandTube,
        Math.max(8, half / 2),
        Math.round(seg * 0.7),
        Math.PI * M.padBandArc,
      ),
      bandEdge: new THREE.TorusGeometry(M.bandRadius, 0.014, 8, Math.round(seg * 0.9), Math.PI),
      arm: new THREE.BoxGeometry(M.armWidth, M.armHeight, M.armDepth),
      armCap: new THREE.CylinderGeometry(M.armWidth * 0.52, M.armWidth * 0.52, M.armDepth, 16),
      slider: new THREE.BoxGeometry(M.armWidth * 0.55, M.armHeight * 0.42, M.armDepth * 1.14),
      yoke: new THREE.TorusGeometry(M.yokeRadius, M.yokeTube, Math.max(8, half / 2), seg),
      hinge: new THREE.CylinderGeometry(0.085, 0.085, 0.13, Math.max(16, half)),
      screw: new THREE.CylinderGeometry(0.034, 0.034, 0.03, Math.max(12, half / 2)),
      rim: new THREE.TorusGeometry(0.556, 0.017, 8, seg),
      plate: new THREE.CylinderGeometry(0.335, 0.355, 0.05, seg),
      plateRing: new THREE.TorusGeometry(0.3, 0.011, 8, seg),
      logoBar: new THREE.BoxGeometry(0.028, 0.17, 0.02),
      pad: new THREE.TorusGeometry(M.padRadius, M.padTube, Math.max(10, half / 2), seg),
      grille: new THREE.CircleGeometry(M.grilleRadius, seg),
      driverDome: new THREE.SphereGeometry(0.26, seg, Math.max(8, half / 3), 0, Math.PI * 2, 0, 0.9),
      driverRing: new THREE.TorusGeometry(0.3, 0.022, 8, seg),
      port: new THREE.BoxGeometry(0.11, 0.05, 0.035),
      button: new THREE.CylinderGeometry(0.038, 0.038, 0.02, 16),
    };
    return geos;
  }, [segments]);
}

/** Una copa completa, construida en su espacio local (eje +Y = hacia fuera). */
function EarCup({
  side,
  refs,
  mats,
  geos,
  shadows,
}: {
  side: 'izq' | 'der';
  refs: CupRefs;
  mats: ProductMaterials;
  geos: ReturnType<typeof useProductGeometries>;
  shadows: boolean;
}) {
  // Signo del «arriba» del mundo dentro del espacio local de la copa.
  const up = side === 'izq' ? 1 : -1;
  const x = side === 'izq' ? -M.cupX : M.cupX;
  const rotZ = side === 'izq' ? Math.PI / 2 : -Math.PI / 2;

  return (
    <group name={`copa-${side}`} position={[x, M.cupY, 0]} rotation={[0, 0, rotZ]}>
      {/* Aro cardán y articulación */}
      <group ref={refs.yoke} name={`cardan-${side}`}>
        <mesh
          name={`aro-cardan-${side}`}
          geometry={geos.yoke}
          material={mats.metal}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={[1, 1, M.cupOval]}
          castShadow={shadows}
        />
        <mesh
          name={`articulacion-${side}`}
          geometry={geos.hinge}
          material={mats.metal}
          position={[M.yokeRadius * up, 0.02, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          castShadow={shadows}
        />
        <mesh
          name={`tornillo-${side}`}
          geometry={geos.screw}
          material={mats.accent}
          position={[M.yokeRadius * up, 0.02, 0.072]}
          rotation={[Math.PI / 2, 0, 0]}
        />
      </group>

      {/* Carcasa exterior */}
      <group ref={refs.shell} name={`carcasa-${side}`}>
        <mesh
          name={`cuerpo-${side}`}
          geometry={geos.cupShell}
          material={mats.shell}
          scale={[1, 1, M.cupOval]}
          castShadow={shadows}
          receiveShadow={shadows}
        />
        <mesh
          name={`puerto-${side}`}
          geometry={geos.port}
          material={mats.grille}
          position={[-0.46 * up, 0.03, 0]}
          rotation={[0, 0, up > 0 ? -0.25 : 0.25]}
        />
        {side === 'der' && (
          <>
            <mesh
              name="boton-superior"
              geometry={geos.button}
              material={mats.metal}
              position={[0.44, 0.16, 0.22]}
              rotation={[0, 0, Math.PI / 2]}
            />
            <mesh
              name="boton-inferior"
              geometry={geos.button}
              material={mats.metal}
              position={[0.3, 0.16, 0.32]}
              rotation={[0, 0, Math.PI / 2]}
            />
          </>
        )}
      </group>

      {/* Aro de acento en el canto */}
      <group ref={refs.rim} name={`canto-${side}`}>
        <mesh
          geometry={geos.rim}
          material={mats.accent}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={[1, 1, M.cupOval]}
        />
      </group>

      {/* Placa exterior con la marca */}
      <group ref={refs.plate} name={`placa-${side}`} position={[0, 0.285, 0]}>
        <mesh
          geometry={geos.plate}
          material={mats.metal}
          scale={[1, 1, M.cupOval]}
          castShadow={shadows}
        />
        <mesh
          geometry={geos.plateRing}
          material={mats.accent}
          position={[0, 0.028, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={[1, 1, M.cupOval]}
        />
        {/* Marca «V»: dos barras en ángulo */}
        <group position={[0, 0.04, 0]} rotation={[0, side === 'izq' ? 0 : Math.PI, 0]}>
          <mesh
            geometry={geos.logoBar}
            material={mats.accentGlow}
            position={[-0.038, 0, 0]}
            rotation={[Math.PI / 2, 0, 0.32]}
          />
          <mesh
            geometry={geos.logoBar}
            material={mats.accentGlow}
            position={[0.038, 0, 0]}
            rotation={[Math.PI / 2, 0, -0.32]}
          />
        </group>
      </group>

      {/* Transductor y rejilla */}
      <group ref={refs.driver} name={`transductor-${side}`} position={[0, -0.13, 0]}>
        <mesh
          geometry={geos.grille}
          material={mats.grille}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[1, M.cupOval, 1]}
        />
        <mesh
          geometry={geos.driverDome}
          material={mats.grille}
          position={[0, -0.03, 0]}
          rotation={[Math.PI, 0, 0]}
          scale={[1, 0.42, M.cupOval]}
        />
        <mesh
          geometry={geos.driverRing}
          material={mats.metal}
          position={[0, -0.005, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={[1, 1, M.cupOval]}
        />
      </group>

      {/* Almohadilla */}
      <group ref={refs.pad} name={`almohadilla-${side}`} position={[0, -0.2, 0]}>
        <mesh
          geometry={geos.pad}
          material={mats.pad}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={[1, 1, M.cupOval]}
          castShadow={shadows}
        />
      </group>
    </group>
  );
}

export function Headphones({ mats, caps }: { mats: ProductMaterials; caps: Capabilities }) {
  const geos = useProductGeometries(caps.segments);
  const izq = useCupRefs();
  const der = useCupRefs();

  const bandRef = useRef<THREE.Group>(null);
  const bandPadRef = useRef<THREE.Group>(null);
  const armLRef = useRef<THREE.Group>(null);
  const armRRef = useRef<THREE.Group>(null);
  const readyRef = useRef(false);
  const raizRef = useRef<THREE.Group>(null);

  /**
   * El reparto de la explosión se adapta al ancho disponible: en una pantalla
   * estrecha las piezas se separan menos para que nunca se salgan de cuadro.
   */
  useFrame(({ camera, size }) => {
    if (!readyRef.current) {
      readyRef.current = true;
      if (raizRef.current) medirProducto(raizRef.current);
    }
    const cam = camera as THREE.PerspectiveCamera;
    const halfW =
      Math.abs(cam.position.z) * Math.tan((cam.fov * Math.PI) / 360) * (size.width / size.height);
    const fit = THREE.MathUtils.clamp(halfW / 3.1, 0.34, 1);
    const e = stage.explode * fit;

    const cup = (r: CupRefs) => {
      if (r.yoke.current) r.yoke.current.position.y = EXPLODE.yoke * e;
      if (r.rim.current) r.rim.current.position.y = EXPLODE.rim * e;
      if (r.plate.current) r.plate.current.position.y = 0.285 + EXPLODE.plate * e;
      if (r.shell.current) r.shell.current.position.y = EXPLODE.shell * e;
      if (r.driver.current) r.driver.current.position.y = -0.13 + EXPLODE.driver * e;
      if (r.pad.current) r.pad.current.position.y = -0.2 + EXPLODE.pad * e;
    };
    cup(izq);
    cup(der);

    if (bandRef.current) bandRef.current.position.y = EXPLODE.band[1] * e;
    if (bandPadRef.current) bandPadRef.current.position.y = EXPLODE.bandPad[1] * e;
    if (armLRef.current) {
      armLRef.current.position.x = -M.bandRadius - EXPLODE.arm[0] * e;
      armLRef.current.position.y = M.armY + EXPLODE.arm[1] * e;
    }
    if (armRRef.current) {
      armRRef.current.position.x = M.bandRadius + EXPLODE.arm[0] * e;
      armRRef.current.position.y = M.armY + EXPLODE.arm[1] * e;
    }
  });

  return (
    <group ref={raizRef} name="vortice-auriculares">
      {/* Diadema */}
      <group ref={bandRef} name="diadema">
        <mesh
          name="arco"
          geometry={geos.band}
          material={mats.metal}
          scale={[1, 1, M.bandFlat]}
          castShadow={caps.shadows}
        />
        <mesh
          name="filete-arco"
          geometry={geos.bandEdge}
          material={mats.accent}
          position={[0, 0, M.bandTube * M.bandFlat + 0.006]}
        />
      </group>

      {/* Acolchado interior de la diadema */}
      <group ref={bandPadRef} name="acolchado-diadema">
        <mesh
          geometry={geos.bandPad}
          material={mats.pad}
          rotation={[0, 0, Math.PI * (1 - M.padBandArc) * 0.5]}
          scale={[1, 1, M.bandFlat * 1.25]}
          castShadow={caps.shadows}
        />
      </group>

      {/* Varillas de extensión */}
      <group ref={armLRef} name="varilla-izq" position={[-M.bandRadius, M.armY, 0]}>
        <mesh geometry={geos.arm} material={mats.metal} castShadow={caps.shadows} />
        <mesh
          geometry={geos.slider}
          material={mats.shell}
          position={[0, -M.armHeight * 0.34, 0]}
        />
        <mesh
          geometry={geos.armCap}
          material={mats.metal}
          position={[0, M.armHeight * 0.5, 0]}
          rotation={[Math.PI / 2, 0, 0]}
        />
      </group>
      <group ref={armRRef} name="varilla-der" position={[M.bandRadius, M.armY, 0]}>
        <mesh geometry={geos.arm} material={mats.metal} castShadow={caps.shadows} />
        <mesh
          geometry={geos.slider}
          material={mats.shell}
          position={[0, -M.armHeight * 0.34, 0]}
        />
        <mesh
          geometry={geos.armCap}
          material={mats.metal}
          position={[0, M.armHeight * 0.5, 0]}
          rotation={[Math.PI / 2, 0, 0]}
        />
      </group>

      <EarCup side="izq" refs={izq} mats={mats} geos={geos} shadows={caps.shadows} />
      <EarCup side="der" refs={der} mats={mats} geos={geos} shadows={caps.shadows} />
    </group>
  );
}
