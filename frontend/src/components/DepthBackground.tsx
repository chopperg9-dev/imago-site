import { useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";

const ORBS = [
  { cls: "bg-terra/20", size: 520, x: "8%", y: "12%", depth: 28 },
  { cls: "bg-sage/15", size: 420, x: "78%", y: "28%", depth: 48 },
  { cls: "bg-mustard/10", size: 360, x: "60%", y: "78%", depth: 70 },
  { cls: "bg-terra/15", size: 300, x: "20%", y: "72%", depth: 90 },
];

export default function DepthBackground() {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 40, damping: 20 });
  const sy = useSpring(my, { stiffness: 40, damping: 20 });

  useEffect(() => {
    const move = (e: MouseEvent) => {
      mx.set(e.clientX / window.innerWidth - 0.5);
      my.set(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener("mousemove", move, { passive: true });
    return () => window.removeEventListener("mousemove", move);
  }, [mx, my]);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-cream">
      {ORBS.map((o) => (
        <Orb key={o.x + o.y} {...o} sx={sx} sy={sy} />
      ))}
      <div className="absolute inset-x-0 bottom-0 h-[42vh] [perspective:600px]">
        <div
          className="absolute inset-x-[-40%] bottom-0 h-full origin-bottom opacity-[0.16] [transform:rotateX(62deg)]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,46,136,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(34,230,255,0.45) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
            maskImage: "linear-gradient(to top, black, transparent 90%)",
          }}
        />
      </div>
    </div>
  );
}

function Orb({ cls, size, x, y, depth, sx, sy }: (typeof ORBS)[number] & { sx: ReturnType<typeof useSpring>; sy: ReturnType<typeof useSpring> }) {
  const tx = useTransform(sx, (v) => v * depth);
  const ty = useTransform(sy, (v) => v * depth);
  return (
    <motion.div
      style={{ width: size, height: size, left: x, top: y, x: tx, y: ty }}
      className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px] ${cls}`}
    />
  );
}
