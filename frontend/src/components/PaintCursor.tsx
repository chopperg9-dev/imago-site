import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

export default function PaintCursor() {
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { stiffness: 260, damping: 24 });
  const ringY = useSpring(y, { stiffness: 260, damping: 24 });
  const dotX = useSpring(x, { stiffness: 1400, damping: 70 });
  const dotY = useSpring(y, { stiffness: 1400, damping: 70 });

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    setEnabled(true);
    const move = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    const over = (e: MouseEvent) =>
      setHovering(Boolean((e.target as HTMLElement).closest("a, button, [role='button'], input, textarea, select, [data-cursor]")));
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseover", over);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", over);
    };
  }, [x, y]);

  if (!enabled) return null;

  return (
    <>
      <motion.div aria-hidden="true" className="pointer-events-none fixed top-0 left-0 z-[100]" style={{ x: dotX, y: dotY }}>
        <div className="h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-terra" />
      </motion.div>
      <motion.div aria-hidden="true" className="pointer-events-none fixed top-0 left-0 z-[100]" style={{ x: ringX, y: ringY }}>
        <motion.div
          className="-translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-terra/60"
          animate={{ width: hovering ? 54 : 30, height: hovering ? 54 : 30, opacity: hovering ? 1 : 0.55 }}
          transition={{ duration: 0.2 }}
        />
      </motion.div>
    </>
  );
}
