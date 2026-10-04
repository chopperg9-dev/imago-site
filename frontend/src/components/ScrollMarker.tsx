import { useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useScroll, useSpring, type MotionValue } from "motion/react";
import type { Group } from "three";
import { Marker3D } from "@/components/Marker3D";

const STOPS = [0, 0.18, 0.36, 0.55, 0.74, 0.9, 1];
const X = [-0.86, -0.7, 0.72, -0.72, 0.62, -0.6, 0.0];
const Y = [0.62, -0.1, -0.35, 0.3, -0.45, 0.2, -0.6];
const SCALE = [0.7, 1.9, 0.75, 1.6, 0.9, 2.1, 1.1];
const AVOID = ['[data-testid="superhero-band"]', '[data-testid="scroll-paint-story"]', "footer"];

function lerpPath(p: number, values: number[]) {
  for (let i = 1; i < STOPS.length; i++) {
    if (p <= STOPS[i]) {
      const t = (p - STOPS[i - 1]) / (STOPS[i] - STOPS[i - 1]);
      const e = t * t * (3 - 2 * t);
      return values[i - 1] + (values[i] - values[i - 1]) * e;
    }
  }
  return values[values.length - 1];
}

function Rig({ progress, visible }: { progress: MotionValue<number>; visible: React.MutableRefObject<boolean> }) {
  const ref = useRef<Group>(null);
  const fade = useRef(1);
  const { viewport } = useThree();
  useFrame((state, dt) => {
    const g = ref.current;
    if (!g) return;
    const p = progress.get();
    const target = visible.current ? 1 : 0;
    fade.current += (target - fade.current) * Math.min(1, dt * 5);
    g.visible = fade.current > 0.02;
    g.position.x = lerpPath(p, X) * (viewport.width / 2) * 0.82;
    g.position.y = lerpPath(p, Y) * (viewport.height / 2) * 0.8;
    const s = lerpPath(p, SCALE) * Math.min(1, viewport.width / 9) * fade.current;
    g.scale.setScalar(s);
    g.rotation.x = p * Math.PI * 4 + 0.6;
    g.rotation.y = p * Math.PI * 6 + state.clock.elapsedTime * 0.25;
    g.rotation.z = Math.sin(p * Math.PI * 3) * 0.9 + 0.5;
  });
  return (
    <group ref={ref}>
      <Marker3D color="#F2762C" length={2.2} capOpen />
    </group>
  );
}

export default function ScrollMarker() {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 55, damping: 18, mass: 0.6 });
  const visible = useRef(true);
  const wrapper = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    const check = () => {
      const vh = window.innerHeight;
      const blocked = AVOID.some((sel) => {
        const el = document.querySelector(sel);
        if (!el) return false;
        const r = el.getBoundingClientRect();
        const overlap = Math.min(r.bottom, vh) - Math.max(r.top, 0);
        return overlap > vh * 0.3;
      });
      visible.current = !blocked;
      wrapper.current?.setAttribute("data-marker-visible", String(!blocked));
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(check);
    };
    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div ref={wrapper} aria-hidden="true" data-testid="scroll-marker" className="pointer-events-none fixed inset-0 z-30 hidden md:block">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 9], fov: 34 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent", pointerEvents: "none" }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[4, 6, 5]} intensity={2.2} />
        <pointLight position={[-5, 2, 2]} intensity={24} color="#FF7A1A" />
        <pointLight position={[5, -2, 3]} intensity={20} color="#3D7BFF" />
        <Rig progress={progress} visible={visible} />
      </Canvas>
    </div>
  );
}
