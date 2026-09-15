/**
 * Escena 3D persistente.
 *
 * Un único lienzo acompaña al visitante de principio a fin: la cámara, el
 * producto y los efectos se mueven entre secciones interpolando el objeto
 * `stage`, que GSAP/ScrollTrigger va rellenando. No hay lienzos por sección.
 */

import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Headphones } from './Headphones';
import { StudioEnvironment } from './StudioEnvironment';
import { WaveField } from './WaveField';
import { PartLabels } from './PartLabels';
import { useFinishMaterials } from './useFinishMaterials';
import { makeGlowTexture, makePoolTexture } from './textures';
import { EXPLODE } from './geometry';
import { stage, poseTarget, smoothing, POSE_KEYS } from '../lib/stageState';
import { poseEnScroll, productoActivo, progresoSonido } from '../scroll/beats';
import { extremosProducto, type Extremos } from './bounds';
import { depuracionActiva, publicarEstado, publicarMedida } from './debug';
import { animate, damp, Easing } from '../lib/easing';
import {
  INTRO,
  IDLE,
  POINTER,
  DRAG,
  ANCHO_ETIQUETAS_3D,
  ajustarAPantalla,
  INTRO_START,
  POSES,
} from '../config/choreography';
import { finishById, type FinishId } from '../config/finishes';
import type { Capabilities } from '../lib/quality';

/** Margen de aire alrededor del producto cuando la pose exige encuadrarlo entero. */
const AIRE = 0.26;

const depurando = depuracionActiva();

/** Progreso de la entrada en función del tiempo transcurrido, en segundos. */
const curvaEntrada = animate({
  start: INTRO.product.delay,
  end: INTRO.product.delay + INTRO.product.duration,
  ease: Easing.easeOutCubic,
});

/** Pose completa de arranque de la secuencia de entrada. */
const ARRANQUE = { ...POSES.intro, ...INTRO_START };

function CameraRig({ saltar }: { saltar: boolean }) {
  const { camera, size } = useThree();
  const luzRef = useRef<THREE.DirectionalLight>(null);
  const target = useMemo(() => new THREE.Vector3(), []);
  const fitZ = useRef(0);
  const extremos = useMemo<Extremos>(() => ({ minX: 0, maxX: 0, minY: 0, maxY: 0 }), []);

  useFrame((_, delta) => {
    const cam = camera as THREE.PerspectiveCamera;
    /**
     * El suavizado exponencial es estable para cualquier `delta`, así que sólo
     * se acota para absorber el salto al volver de una pestaña oculta. Acotarlo
     * a 0,05 hacía que en equipos lentos (por debajo de ~20 fps) la escena se
     * quedara muy por detrás del desplazamiento.
     */
    const dt = Math.min(delta, 0.25);
    const aspect = size.width / size.height;

    // La pose objetivo se deriva del scroll en cada fotograma: es una función
    // pura, así que retroceder deshace exactamente lo que hizo avanzar.
    const y = window.scrollY;
    poseEnScroll(y, poseTarget, saltar);
    ajustarAPantalla(poseTarget, aspect < 1);
    stage.soundProgress = progresoSonido(y);
    stage.interactive = productoActivo(y);

    if (stage.introStart > 0) {
      const transcurrido = (performance.now() - stage.introStart) / 1000;
      stage.intro = curvaEntrada(transcurrido);
      if (stage.intro >= 1) stage.introStart = 0;
    }

    // La entrada se mezcla por encima: no compite con el scroll, lo tiñe.
    // Así, si alguien se desplaza mientras entra el producto, las dos cosas
    // conviven en lugar de pisarse.
    if (stage.intro < 1) {
      const t = stage.intro;
      for (const k of POSE_KEYS) {
        poseTarget[k] = ARRANQUE[k] + (poseTarget[k] - ARRANQUE[k]) * t;
      }
    }

    // Suavizado de la pose. CameraRig es el primer suscriptor del bucle, así
    // que todo lo que se dibuje después ve ya el valor actualizado.
    for (const k of POSE_KEYS) {
      stage[k] = damp(stage[k], poseTarget[k], smoothing.lambda, dt);
    }

    if (Math.abs(cam.fov - stage.fov) > 0.01) {
      cam.fov = stage.fov;
      cam.updateProjectionMatrix();
    }

    const tanHalf = Math.tan((cam.fov * Math.PI) / 360);

    // Encuadre garantizado: en las poses que deben mostrar el producto entero
    // (fit = 1) la cámara retrocede lo necesario para que nada se recorte,
    // sea cual sea la proporción de la pantalla.
    const conEtiquetas = size.width > ANCHO_ETIQUETAS_3D ? 1 : 0;
    // Las piezas se separan menos si hay poco ancho: el mismo factor que usa
    // el modelo para repartir la explosión.
    const anchoVisible = fitZ.current * tanHalf * aspect;
    const reparto = THREE.MathUtils.clamp(anchoVisible / 3.1, 0.34, 1);
    const separacion = EXPLODE.yoke * stage.explode * reparto;

    extremosProducto(stage, separacion, extremos);
    const halfW =
      Math.max(Math.abs(extremos.minX), Math.abs(extremos.maxX)) +
      1.72 * stage.labels * conEtiquetas +
      AIRE;
    const halfH =
      Math.max(extremos.maxY - stage.lookY, stage.lookY - extremos.minY, 0) + AIRE;
    const needed = Math.max(halfW / (tanHalf * aspect), halfH / tanHalf);
    const wanted = Math.max(stage.camZ, needed * stage.fit + stage.camZ * (1 - stage.fit));
    fitZ.current = fitZ.current === 0 ? wanted : damp(fitZ.current, wanted, 9, dt);

    // Paralaje del puntero: suave y de poco recorrido, nunca mareante.
    const lambda = POINTER.damping;
    stage.smoothX = damp(stage.smoothX, stage.pointerX, lambda, dt);
    stage.smoothY = damp(stage.smoothY, stage.pointerY, lambda, dt);

    const px = stage.smoothX * POINTER.camParallaxX * stage.motion;
    const py = stage.smoothY * POINTER.camParallaxY * stage.motion;

    cam.position.set(stage.camX + px, stage.camY + py, fitZ.current);
    target.set(0, stage.lookY, 0);
    cam.lookAt(target);

    // La clave viaja con la cámara, desplazada en diagonal para que siga
    // habiendo modelado y no una iluminación plana de flash.
    if (luzRef.current) {
      luzRef.current.position.set(
        cam.position.x + fitZ.current * 0.34,
        cam.position.y + fitZ.current * 0.42,
        cam.position.z * 0.86,
      );
    }

    if (depurando) {
      publicarEstado(() => ({
        camZ: +fitZ.current.toFixed(3),
        poseZ: +stage.camZ.toFixed(3),
        needed: +needed.toFixed(3),
        fit: +stage.fit.toFixed(3),
        scale: +stage.scale.toFixed(3),
        posY: +stage.posY.toFixed(3),
        halfH: +halfH.toFixed(3),
        visibleHalfH: +(fitZ.current * tanHalf).toFixed(3),
        minY: +extremos.minY.toFixed(3),
        maxY: +extremos.maxY.toFixed(3),
        intro: +stage.intro.toFixed(3),
        dragY: +stage.dragY.toFixed(3),
        motion: stage.motion,
        waves: +stage.waves.toFixed(3),
        labels: +stage.labels.toFixed(3),
      }));
    }
  });

  return (
    <directionalLight ref={luzRef} intensity={1.35} color="#fff4e8" />
  );
}

function Product({
  finish,
  caps,
  modelRef,
}: {
  finish: FinishId;
  caps: Capabilities;
  modelRef: React.RefObject<THREE.Group | null>;
}) {
  const mats = useFinishMaterials(finish, caps.tier);
  const clock = useRef(0);
  const medido = useRef(false);
  const camara = useThree((s) => s.camera);
  const tamano = useThree((s) => s.size);

  useFrame((_, delta) => {
    const g = modelRef.current;
    if (!g) return;
    const dt = Math.min(delta, 0.05);
    if (depurando && !medido.current) {
      medido.current = true;
      publicarMedida(g, camara, tamano.width, tamano.height);
    }
    clock.current += dt * stage.motion * stage.visible;
    const t = clock.current;

    // Inercia del arrastre manual
    if (Math.abs(stage.velY) > 0.00002 || Math.abs(stage.velX) > 0.00002) {
      stage.dragY += stage.velY;
      stage.dragX = THREE.MathUtils.clamp(stage.dragX + stage.velX, -DRAG.maxPitch, DRAG.maxPitch);
      stage.velY *= DRAG.friction;
      stage.velX *= DRAG.friction;
    }

    // Movimiento ocioso: respiración y balanceo (sólo con movimiento activo)
    const breathe =
      Math.sin((t / IDLE.floatPeriod) * Math.PI * 2) * IDLE.floatAmplitude * stage.motion;
    const sway = Math.sin((t / IDLE.swayPeriod) * Math.PI * 2) * IDLE.swayAmplitude * stage.motion;
    const spin = stage.interactive * IDLE.autoSpin * t * stage.motion;

    const pointerY = stage.smoothX * POINTER.maxRotY * stage.motion;
    const pointerX = -stage.smoothY * POINTER.maxRotX * stage.motion;

    g.rotation.set(
      stage.rotX + pointerX + stage.dragX,
      stage.rotY + sway + spin + pointerY + stage.dragY,
      stage.rotZ,
    );
    g.position.set(stage.posX, stage.posY + breathe, stage.posZ);
    g.scale.setScalar(stage.scale);
    g.updateMatrixWorld();
  });

  return (
    <group ref={modelRef} name="producto">
      <Headphones mats={mats} caps={caps} />
    </group>
  );
}

function Atmosphere({ accent, tier }: { accent: string; tier: Capabilities['tier'] }) {
  const glowRef = useRef<THREE.Mesh>(null);
  const poolRef = useRef<THREE.Mesh>(null);
  const ringsRef = useRef<THREE.Group>(null);
  const clock = useRef(0);

  const glowTex = useMemo(makeGlowTexture, []);
  const poolTex = useMemo(makePoolTexture, []);
  const accentColor = useMemo(() => new THREE.Color(accent), [accent]);

  useEffect(
    () => () => {
      glowTex.dispose();
      poolTex.dispose();
    },
    [glowTex, poolTex],
  );

  const ringGeo = useMemo(() => new THREE.TorusGeometry(2.6, 0.007, 3, 128), []);
  useEffect(() => () => ringGeo.dispose(), [ringGeo]);

  useFrame((_, delta) => {
    clock.current += Math.min(delta, 0.05) * stage.motion * stage.visible;
    const t = clock.current;

    if (glowRef.current) {
      const m = glowRef.current.material as THREE.MeshBasicMaterial;
      m.opacity = stage.glow * 0.62;
      m.color.copy(accentColor);
      glowRef.current.visible = m.opacity > 0.01;
    }
    if (poolRef.current) {
      const m = poolRef.current.material as THREE.MeshBasicMaterial;
      m.opacity = stage.floor * 0.5;
      poolRef.current.visible = m.opacity > 0.01;
    }
    if (ringsRef.current) {
      ringsRef.current.visible = stage.glow > 0.02 && tier !== 'bajo';
      ringsRef.current.rotation.z = t * 0.08;
      ringsRef.current.rotation.x = 1.05 + Math.sin(t * 0.13) * 0.08;
      ringsRef.current.children.forEach((child, i) => {
        const mesh = child as THREE.Mesh;
        const m = mesh.material as THREE.MeshBasicMaterial;
        m.opacity = stage.glow * (0.3 - i * 0.07);
        m.color.copy(accentColor);
      });
    }
  });

  return (
    <>
      {/* Halo de acento detrás del producto */}
      <mesh ref={glowRef} name="halo" position={[0, -0.1, -2.2]} scale={[9, 9, 1]}>
        <planeGeometry />
        <meshBasicMaterial
          map={glowTex}
          transparent
          depthWrite={false}
          depthTest={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>

      {/* Charco de luz bajo el producto */}
      <mesh
        ref={poolRef}
        name="charco"
        position={[0, -1.72, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={[5.2, 3.1, 1]}
      >
        <planeGeometry />
        <meshBasicMaterial
          map={poolTex}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
          color="#f2ede4"
        />
      </mesh>

      {/* Anillos del vórtice */}
      <group ref={ringsRef} name="vortice" position={[0, -0.1, -1.4]}>
        {[1, 0.78, 0.58].map((s, i) => (
          <mesh key={s} geometry={ringGeo} scale={[s, s, 1]} rotation={[0, 0, i * 0.4]}>
            <meshBasicMaterial
              transparent
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              toneMapped={false}
            />
          </mesh>
        ))}
      </group>
    </>
  );
}

export function Scene({
  finish,
  caps,
  saltar,
}: {
  finish: FinishId;
  caps: Capabilities;
  saltar: boolean;
}) {
  const modelRef = useRef<THREE.Group>(null);
  const accent = finishById(finish).accent;
  const { gl } = useThree();

  useEffect(() => {
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.05;
  }, [gl]);

  return (
    <>
      <CameraRig saltar={saltar} />

      {/* Iluminación de estudio: hemisférica + clave + relleno + contraluz.
          El entorno se construye con lightformers en escena (sin descargas). */}
      <hemisphereLight args={['#cfd6e4', '#1a1712', 0.72]} />
      <directionalLight position={[3.4, 4.2, 3.6]} intensity={2.1} color="#fff6ea" />
      <directionalLight position={[-4.2, 1.4, 2.2]} intensity={0.75} color="#9fb6d8" />
      <directionalLight position={[0, 1.2, -5]} intensity={1.05} color={accent} />
      <pointLight position={[0, -2.2, 1.4]} intensity={1.55} distance={7.5} color="#fff1e2" />

      <StudioEnvironment />

      <Atmosphere accent={accent} tier={caps.tier} />
      <Product finish={finish} caps={caps} modelRef={modelRef} />
      <PartLabels accent={accent} modelRef={modelRef} />
      <WaveField tier={caps.tier} accent={accent} />
    </>
  );
}
