import { Float } from "@react-three/drei";

const MARKER_COLORS = ["#F2762C", "#FF2E88", "#22E6FF", "#C6FF3D", "#9B5CFF", "#FBE9D0", "#4A2A1E", "#FFD23F"];

interface MarkerProps {
  color: string;
  length?: number;
  capOpen?: boolean;
}

// Procedural acrylic paint marker: white barrel, coloured cap, coloured band and felt tip
export function Marker3D({ color, length = 1.6, capOpen = false }: MarkerProps) {
  const r = length * 0.055;
  const barrel = length * 0.58;
  const cap = length * 0.3;
  return (
    <group>
      <mesh position={[0, -length * 0.08, 0]} castShadow>
        <cylinderGeometry args={[r, r, barrel, 32]} />
        <meshStandardMaterial color="#F4F3EF" roughness={0.35} metalness={0.05} />
      </mesh>
      <mesh position={[0, -length * 0.08 - barrel * 0.33, 0]}>
        <cylinderGeometry args={[r * 1.02, r * 1.02, barrel * 0.16, 32]} />
        <meshStandardMaterial color={color} roughness={0.3} />
      </mesh>
      <mesh position={[0, -length * 0.08 - barrel / 2 - r * 0.6, 0]}>
        <sphereGeometry args={[r * 1.0, 24, 24]} />
        <meshStandardMaterial color="#15151A" roughness={0.4} />
      </mesh>
      {capOpen ? (
        <>
          <mesh position={[0, barrel * 0.42 + r * 0.9, 0]}>
            <cylinderGeometry args={[r * 0.45, r * 0.8, r * 1.6, 24]} />
            <meshStandardMaterial color="#15151A" roughness={0.6} />
          </mesh>
          <mesh position={[0, barrel * 0.42 + r * 2.3, 0]}>
            <coneGeometry args={[r * 0.45, r * 1.6, 24]} />
            <meshStandardMaterial color={color} roughness={0.85} />
          </mesh>
        </>
      ) : (
        <>
          <mesh position={[0, barrel * 0.42 + cap / 2 - r * 0.4, 0]} castShadow>
            <cylinderGeometry args={[r * 1.12, r * 1.12, cap, 32]} />
            <meshStandardMaterial color={color} roughness={0.22} metalness={0.08} />
          </mesh>
          <mesh position={[0, barrel * 0.42 + cap - r * 0.2, 0]}>
            <sphereGeometry args={[r * 1.12, 24, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color={color} roughness={0.22} metalness={0.08} />
          </mesh>
          <mesh position={[r * 1.3, barrel * 0.42 + cap * 0.55, 0]}>
            <boxGeometry args={[r * 0.5, cap * 0.7, r * 0.7]} />
            <meshStandardMaterial color={color} roughness={0.3} />
          </mesh>
        </>
      )}
    </group>
  );
}

// Ring of floating markers around the origin
export function MarkerRing({ radius = 1.35, count = 8, y = 0.1 }: { radius?: number; count?: number; y?: number }) {
  return (
    <group>
      {Array.from({ length: count }).map((_, i) => {
        const a = (i / count) * Math.PI * 2;
        const x = Math.cos(a) * radius;
        const z = Math.sin(a) * radius;
        const tilt = ((i % 3) - 1) * 0.55;
        return (
          <Float key={i} speed={1.1 + (i % 4) * 0.25} rotationIntensity={0.5} floatIntensity={0.9} floatingRange={[-0.12, 0.12]}>
            <group position={[x, y + ((i % 2) * 0.35 - 0.15), z]} rotation={[tilt, -a, 0.45 + (i % 2) * 0.4]}>
              <Marker3D color={MARKER_COLORS[i % MARKER_COLORS.length]} length={0.8} capOpen={i % 3 === 0} />
            </group>
          </Float>
        );
      })}
    </group>
  );
}
