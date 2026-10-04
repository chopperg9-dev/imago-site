import { Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { ContactShadows, Float, OrbitControls, useGLTF } from "@react-three/drei";
import { BufferAttribute, BufferGeometry, Color, Mesh, Vector3, type Group } from "three";
import { MELANIE_PRESET, WHITE } from "@/lib/foxColors";

const MODEL_URL = "/models/melanie.glb";
useGLTF.preload(MODEL_URL);

export interface FoxApi {
  reset: () => void;
  preset: () => void;
}

interface MelanieProps {
  markerHex: string;
  paintable: boolean;
  spinning: boolean;
  onProgress?: (ratio: number) => void;
  apiRef?: React.MutableRefObject<FoxApi | null>;
  modelScale?: number;
  modelY?: number;
}

const BRUSH = 0.055;
const white = new Color(WHITE);

function MelanieMesh({ markerHex, paintable, spinning, onProgress, apiRef, modelScale = 1.9, modelY = -0.95 }: MelanieProps) {
  const { scene } = useGLTF(MODEL_URL);
  const group = useRef<Group>(null);
  const mesh = useRef<Mesh>(null);
  const painting = useRef(false);
  const lastPoint = useRef<Vector3 | null>(null);
  const [hovered, setHovered] = useState(false);

  const { geometry, painted } = useMemo(() => {
    let src: BufferGeometry | null = null;
    scene.traverse((o) => {
      if (!src && (o as Mesh).isMesh) src = (o as Mesh).geometry;
    });
    const g = (src as unknown as BufferGeometry).clone();
    const count = g.attributes.position.count;
    const colors = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) white.toArray(colors, i * 3);
    g.setAttribute("color", new BufferAttribute(colors, 3));
    if (!g.attributes.normal) g.computeVertexNormals();
    return { geometry: g, painted: new Uint8Array(count) };
  }, [scene]);

  const report = () => {
    if (!onProgress) return;
    let n = 0;
    for (let i = 0; i < painted.length; i++) n += painted[i];
    onProgress(n / painted.length);
  };

  const paintAt = (worldPoint: Vector3, hex: string) => {
    const m = mesh.current;
    if (!m) return;
    const local = m.worldToLocal(worldPoint.clone());
    const pos = geometry.attributes.position.array as Float32Array;
    const col = geometry.attributes.color as BufferAttribute;
    const arr = col.array as Float32Array;
    const c = new Color(hex);
    const r2 = BRUSH * BRUSH;
    for (let i = 0; i < painted.length; i++) {
      const dx = pos[i * 3] - local.x;
      const dy = pos[i * 3 + 1] - local.y;
      const dz = pos[i * 3 + 2] - local.z;
      if (dx * dx + dy * dy + dz * dz < r2) {
        arr[i * 3] = c.r;
        arr[i * 3 + 1] = c.g;
        arr[i * 3 + 2] = c.b;
        painted[i] = 1;
      }
    }
    col.needsUpdate = true;
  };

  const stroke = (point: Vector3) => {
    const prev = lastPoint.current;
    if (prev) {
      const d = prev.distanceTo(point);
      const steps = Math.min(6, Math.ceil(d / (BRUSH * 0.6)));
      for (let s = 1; s < steps; s++) paintAt(prev.clone().lerp(point, s / steps), markerHex);
    }
    paintAt(point, markerHex);
    lastPoint.current = point.clone();
  };

  useEffect(() => {
    if (!apiRef) return;
    apiRef.current = {
      reset: () => {
        const arr = (geometry.attributes.color as BufferAttribute).array as Float32Array;
        for (let i = 0; i < painted.length; i++) white.toArray(arr, i * 3);
        painted.fill(0);
        (geometry.attributes.color as BufferAttribute).needsUpdate = true;
        onProgress?.(0);
      },
      preset: () => {
        const pos = geometry.attributes.position.array as Float32Array;
        const arr = (geometry.attributes.color as BufferAttribute).array as Float32Array;
        const tmp = new Color();
        for (let i = 0; i < painted.length; i++) {
          tmp.set(MELANIE_PRESET(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]));
          tmp.toArray(arr, i * 3);
          painted[i] = 1;
        }
        (geometry.attributes.color as BufferAttribute).needsUpdate = true;
        onProgress?.(1);
      },
    };
    return () => {
      apiRef.current = null;
    };
  }, [apiRef, geometry, painted, onProgress]);

  useEffect(() => {
    const up = () => {
      if (painting.current) report();
      painting.current = false;
      lastPoint.current = null;
    };
    window.addEventListener("pointerup", up);
    return () => window.removeEventListener("pointerup", up);
  });

  useFrame((_, dt) => {
    if (group.current && spinning && !hovered && !painting.current) group.current.rotation.y += dt * 0.3;
  });

  const down = (e: ThreeEvent<PointerEvent>) => {
    if (!paintable) return;
    e.stopPropagation();
    painting.current = true;
    lastPoint.current = null;
    stroke(e.point);
  };
  const move = (e: ThreeEvent<PointerEvent>) => {
    if (!paintable || !painting.current) return;
    e.stopPropagation();
    stroke(e.point);
  };

  return (
    <group ref={group} position={[0, modelY, 0]} rotation={[0, 0.35, 0]} scale={modelScale}>
      <mesh
        ref={mesh}
        geometry={geometry}
        castShadow
        receiveShadow
        onPointerDown={down}
        onPointerMove={move}
        onPointerOver={() => { setHovered(true); if (paintable) document.body.style.cursor = "crosshair"; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = ""; }}
      >
        <meshStandardMaterial vertexColors roughness={0.38} metalness={0.04} />
      </mesh>
    </group>
  );
}

export default function FoxModel({
  markerHex = WHITE,
  paintable = false,
  spinning = true,
  onProgress,
  apiRef,
  modelScale,
  modelY,
  cameraZ = 4.6,
  targetY = 0.05,
  autoRotate = false,
  children,
}: Partial<MelanieProps> & { cameraZ?: number; targetY?: number; autoRotate?: boolean; children?: ReactNode }) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      camera={{ position: [1.6, 0.7, cameraZ], fov: 32 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent", touchAction: "pan-y" }}
    >
      <hemisphereLight intensity={0.5} color="#ffffff" groundColor="#2a0e1c" />
      <directionalLight position={[3, 5, 4]} intensity={2.4} castShadow shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[-3, 2, -2]} intensity={0.6} color="#ffffff" />
      <pointLight position={[-4, 1.5, -1]} intensity={30} color="#FF2E88" />
      <pointLight position={[4, 0.5, -3]} intensity={26} color="#22E6FF" />
      <pointLight position={[0, -1, 4]} intensity={6} color="#C6FF3D" />
      <Suspense fallback={null}>
        <Float speed={1.4} rotationIntensity={0.08} floatIntensity={0.35}>
          <MelanieMesh markerHex={markerHex} paintable={paintable} spinning={spinning} onProgress={onProgress} apiRef={apiRef} modelScale={modelScale} modelY={modelY} />
        </Float>
        {children}
        <ContactShadows position={[0, (modelY ?? -0.95) - 0.03, 0]} opacity={0.6} scale={5} blur={2.4} far={2.5} color="#000" />
      </Suspense>
      <OrbitControls enableZoom={false} enablePan={false} enableDamping dampingFactor={0.08} autoRotate={autoRotate} autoRotateSpeed={1.2} minPolarAngle={0.7} maxPolarAngle={1.8} target={[0, targetY, 0]} makeDefault />
    </Canvas>
  );
}
