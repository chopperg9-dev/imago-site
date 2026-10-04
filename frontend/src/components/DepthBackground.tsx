import { useEffect, useMemo } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";

const ORBS = [
  { cls: "bg-[#3D7BFF]/25", size: 620, x: "12%", y: "10%", depth: 26 },
  { cls: "bg-sage/15", size: 440, x: "80%", y: "26%", depth: 46 },
  { cls: "bg-terra/20", size: 420, x: "62%", y: "80%", depth: 68 },
  { cls: "bg-[#6A3DFF]/18", size: 360, x: "18%", y: "74%", depth: 92 },
];

function makeDust(n: number, seed: number) {
  let s = seed;
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  return Array.from({ length: n }, () => ({ x: rnd() * 100, y: rnd() * 100, r: 0.8 + rnd() * 1.6, o: 0.25 + rnd() * 0.55 }));
}

export default function DepthBackground() {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 40, damping: 20 });
  const sy = useSpring(my, { stiffness: 40, damping: 20 });
  const near = useMemo(() => makeDust(34, 7), []);
  const far = useMemo(() => makeDust(60, 23), []);

  useEffect(() => {
    const move = (e: MouseEvent) => {
      mx.set(e.clientX / window.innerWidth - 0.5);
      my.set(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener("mousemove", move, { passive: true });
    return () => window.removeEventListener("mousemove", move);
  }, [mx, my]);

  return (
    <div aria-hidden="true" data-testid="depth-background" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-cream">
      {ORBS.map((o) => (
        <Orb key={o.x + o.y} {...o} sx={sx} sy={sy} />
      ))}

      <DustLayer dots={far} size={0.6} duration={140} parallax={10} sx={sx} sy={sy} />
      <DustLayer dots={near} size={1} duration={80} parallax={34} sx={sx} sy={sy} />

      <div className="absolute inset-x-0 bottom-0 h-[46vh] [perspective:640px]">
        <div
          className="absolute inset-x-[-40%] bottom-0 h-full origin-bottom opacity-[0.2] [transform:rotateX(64deg)]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(61,123,255,0.55) 1px, transparent 1px), linear-gradient(90deg, rgba(47,216,255,0.4) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
            maskImage: "linear-gradient(to top, black, transparent 88%)",
          }}
        />
      </div>

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(0,0,0,0.55)_100%)]" />
    </div>
  );
}

type Spring = ReturnType<typeof useSpring>;

function Orb({ cls, size, x, y, depth, sx, sy }: (typeof ORBS)[number] & { sx: Spring; sy: Spring }) {
  const tx = useTransform(sx, (v) => v * depth);
  const ty = useTransform(sy, (v) => v * depth);
  return (
    <motion.div
      style={{ width: size, height: size, left: x, top: y, x: tx, y: ty }}
      className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full blur-[130px] ${cls}`}
    />
  );
}

function DustLayer({ dots, size, duration, parallax, sx, sy }: { dots: ReturnType<typeof makeDust>; size: number; duration: number; parallax: number; sx: Spring; sy: Spring }) {
  const tx = useTransform(sx, (v) => v * parallax);
  const ty = useTransform(sy, (v) => v * parallax);
  return (
    <motion.div style={{ x: tx, y: ty }} className="absolute inset-[-10%]">
      <svg className="h-full w-full" style={{ animation: `float-soft ${duration / 6}s ease-in-out infinite` }} preserveAspectRatio="none" viewBox="0 0 100 100">
        {dots.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r={d.r * 0.06 * size} fill="#DDE7FF" opacity={d.o} />
        ))}
      </svg>
    </motion.div>
  );
}
