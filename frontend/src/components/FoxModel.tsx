import { Suspense, useRef, useState } from "react";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { ContactShadows, Float, OrbitControls } from "@react-three/drei";
import type { Group } from "three";

import type { FoxColors, FoxPart } from "@/lib/foxColors";

interface FoxProps {
  colors: FoxColors;
  onPaint?: (part: FoxPart) => void;
  spinning: boolean;
}

function Fox({ colors, onPaint, spinning }: FoxProps) {
  const ref = useRef<Group>(null);
  const [hovered, setHovered] = useState(false);
  useFrame((_, dt) => {
    if (ref.current && spinning && !hovered) ref.current.rotation.y += dt * 0.45;
  });
  const dark = "#1A1A1F";
  return (
    <group
      ref={ref}
      position={[0, -0.95, 0]}
      scale={0.82}
      onPointerOver={(e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); setHovered(true); }}
      onPointerOut={() => setHovered(false)}
    >
      <mesh position={[0, 0.85, 0]} castShadow onClick={(e) => { e.stopPropagation(); onPaint?.("body"); }}>
        <sphereGeometry args={[0.72, 48, 48]} />
        <meshStandardMaterial color={colors.body} roughness={0.42} metalness={0.05} />
      </mesh>
      <mesh position={[0, 0.78, 0.5]} scale={[0.72, 0.9, 0.55]} onClick={(e) => { e.stopPropagation(); onPaint?.("belly"); }}>
        <sphereGeometry args={[0.52, 40, 40]} />
        <meshStandardMaterial color={colors.belly} roughness={0.5} />
      </mesh>
      <mesh position={[0, 1.85, 0.08]} castShadow onClick={(e) => { e.stopPropagation(); onPaint?.("head"); }}>
        <sphereGeometry args={[0.78, 56, 56]} />
        <meshStandardMaterial color={colors.head} roughness={0.42} metalness={0.05} />
      </mesh>
      <mesh position={[0, 1.6, 0.72]} scale={[0.75, 0.6, 0.7]} onClick={(e) => { e.stopPropagation(); onPaint?.("belly"); }}>
        <sphereGeometry args={[0.42, 40, 40]} />
        <meshStandardMaterial color={colors.belly} roughness={0.5} />
      </mesh>
      <mesh position={[0, 1.66, 1.0]}>
        <sphereGeometry args={[0.12, 24, 24]} />
        <meshStandardMaterial color={dark} roughness={0.25} />
      </mesh>
      {[-0.3, 0.3].map((x) => (
        <mesh key={x} position={[x, 1.98, 0.62]}>
          <sphereGeometry args={[0.1, 24, 24]} />
          <meshStandardMaterial color={dark} roughness={0.2} />
        </mesh>
      ))}
      {[-0.5, 0.5].map((x) => (
        <mesh key={x} position={[x, 2.72, -0.05]} rotation={[0, 0, x > 0 ? -0.35 : 0.35]} castShadow onClick={(e) => { e.stopPropagation(); onPaint?.("ears"); }}>
          <coneGeometry args={[0.34, 0.9, 32]} />
          <meshStandardMaterial color={colors.ears} roughness={0.45} />
        </mesh>
      ))}
      {[[-0.42, 0.35], [0.42, 0.35], [-0.38, -0.3], [0.38, -0.3]].map(([x, z]) => (
        <mesh key={`${x}${z}`} position={[x, 0.22, z]} castShadow onClick={(e) => { e.stopPropagation(); onPaint?.("legs"); }}>
          <capsuleGeometry args={[0.17, 0.3, 8, 24]} />
          <meshStandardMaterial color={colors.legs} roughness={0.5} />
        </mesh>
      ))}
      <group position={[0, 0.7, -0.75]} rotation={[0.9, 0, 0]}>
        <mesh castShadow onClick={(e) => { e.stopPropagation(); onPaint?.("tail"); }}>
          <capsuleGeometry args={[0.3, 0.9, 12, 32]} />
          <meshStandardMaterial color={colors.tail} roughness={0.45} />
        </mesh>
        <mesh position={[0, 0.75, 0]} onClick={(e) => { e.stopPropagation(); onPaint?.("tailTip"); }}>
          <sphereGeometry args={[0.32, 32, 32]} />
          <meshStandardMaterial color={colors.tailTip} roughness={0.45} />
        </mesh>
      </group>
    </group>
  );
}

export default function FoxModel({ colors, onPaint, spinning = true }: Partial<FoxProps> & { colors: FoxColors }) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      camera={{ position: [4.4, 2.0, 8.3], fov: 34 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent", touchAction: "pan-y" }}
    >
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 6, 3]} intensity={2.1} castShadow shadow-mapSize={[1024, 1024]} />
      <pointLight position={[-4, 2, -2]} intensity={28} color="#FF2E88" />
      <pointLight position={[4, 1, -3]} intensity={24} color="#22E6FF" />
      <pointLight position={[0, -1, 4]} intensity={6} color="#C6FF3D" />
      <Suspense fallback={null}>
        <Float speed={1.6} rotationIntensity={0.15} floatIntensity={0.5}>
          <Fox colors={colors} onPaint={onPaint} spinning={spinning} />
        </Float>
        <ContactShadows position={[0, -1.0, 0]} opacity={0.55} scale={7} blur={2.6} far={3} color="#000" />
      </Suspense>
      <OrbitControls enableZoom={false} enablePan={false} enableDamping dampingFactor={0.08} minPolarAngle={0.9} maxPolarAngle={1.75} target={[0, 0.35, 0]} makeDefault />
    </Canvas>
  );
}
