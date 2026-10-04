import { useRef, useState } from "react";
import { motion } from "motion/react";
import type { ReactNode } from "react";

const COLORS = ["#FF2E88", "#22E6FF", "#C6FF3D", "#9B5CFF"];
const MIN_DIST_SQ = 40 * 40;

interface Drop {
  id: number;
  x: number;
  y: number;
  c: string;
  s: number;
}

export default function PaintTrail({ children, className }: { children: ReactNode; className?: string }) {
  const [drops, setDrops] = useState<Drop[]>([]);
  const last = useRef({ x: -9999, y: -9999 });
  const idRef = useRef(0);

  const spawn = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const dx = x - last.current.x;
    const dy = y - last.current.y;
    if (dx * dx + dy * dy < MIN_DIST_SQ) return;
    last.current = { x, y };
    const id = ++idRef.current;
    const drop: Drop = { id, x, y, c: COLORS[id % COLORS.length], s: 7 + (id % 3) * 5 };
    setDrops((d) => [...d.slice(-28), drop]);
    setTimeout(() => setDrops((d) => d.filter((p) => p.id !== id)), 850);
  };

  return (
    <div className={className} onPointerMove={spawn}>
      {children}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-30 overflow-hidden">
        {drops.map((d) => (
          <motion.span
            key={d.id}
            className="absolute rounded-full"
            style={{ left: d.x, top: d.y, width: d.s, height: d.s, backgroundColor: d.c }}
            initial={{ scale: 0.3, opacity: 0.85 }}
            animate={{ scale: 1.7, opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        ))}
      </div>
    </div>
  );
}
