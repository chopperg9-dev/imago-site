import { useEffect, useRef, useState } from "react";
import { animate, motion, useMotionValue, useSpring, useTransform } from "motion/react";

const HERO_BEFORE =
  "https://static.prod-images.emergentagent.com/jobs/4ce74442-beb6-4a2a-a71b-521399fd659c/images/4ef63e567478ed3b2312943b98c2f2256715d375fa6b19ce1a55db0219e05db7.jpeg";
const HERO_AFTER =
  "https://static.prod-images.emergentagent.com/jobs/4ce74442-beb6-4a2a-a71b-521399fd659c/images/181cf0f8a44ea5f48676d5582a202354044ea811084cd01837cd22a00b420fbe.jpeg";

export default function BeforeAfterSlider() {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(100);
  const dragging = useRef(false);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [5, -5]), { stiffness: 120, damping: 16 });
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-5, 5]), { stiffness: 120, damping: 16 });

  useEffect(() => {
    const controls = animate(100, 42, {
      duration: 2.2,
      delay: 1.2,
      ease: [0.65, 0, 0.35, 1],
      onUpdate: (v) => setPos(v),
    });
    return () => controls.stop();
  }, []);

  const updateFromClientX = (clientX: number) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const p = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.min(96, Math.max(4, p)));
  };

  return (
    <motion.div
      style={{ rotateX, rotateY, transformStyle: "preserve-3d", perspective: 900 }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        mx.set((e.clientX - rect.left) / rect.width - 0.5);
        my.set((e.clientY - rect.top) / rect.height - 0.5);
      }}
      onMouseLeave={() => {
        mx.set(0);
        my.set(0);
      }}
      className="relative"
    >
      <div
        ref={ref}
        data-testid="before-after-slider"
        role="slider"
        aria-label="השוואת לפני ואחרי צביעה"
        aria-valuenow={Math.round(pos)}
        aria-valuemin={0}
        aria-valuemax={100}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") setPos((p) => Math.min(96, p + 4));
          if (e.key === "ArrowRight") setPos((p) => Math.max(4, p - 4));
        }}
        onPointerDown={(e) => {
          dragging.current = true;
          e.currentTarget.setPointerCapture(e.pointerId);
          updateFromClientX(e.clientX);
        }}
        onPointerMove={(e) => {
          if (dragging.current) updateFromClientX(e.clientX);
        }}
        onPointerUp={() => {
          dragging.current = false;
        }}
        className="relative aspect-[4/5] cursor-ew-resize touch-none select-none overflow-hidden rounded-[2rem] border border-clay/10 bg-stage shadow-[0_32px_80px_-24px_rgba(0,0,0,0.35)] outline-none focus-visible:ring-2 focus-visible:ring-terra"
      >
        <img
          src={HERO_BEFORE}
          alt="בובה לבנה לפני צביעה"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          draggable={false}
        />
        <img
          src={HERO_AFTER}
          alt="אותה בובה אחרי צביעה מלאה"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
          draggable={false}
        />

        <span className="absolute top-4 right-4 rounded-full bg-ink/70 px-3 py-1 text-xs font-medium text-white backdrop-blur">
          לפני
        </span>
        <span className="absolute top-4 left-4 rounded-full bg-terra px-3 py-1 text-xs font-medium text-white">
          אחרי
        </span>

        <div className="absolute inset-y-0" style={{ left: `${pos}%` }}>
          <div className="absolute inset-y-0 -ml-px w-0.5 bg-ink/90 shadow" />
          <button
            type="button"
            data-testid="before-after-handle"
            aria-label="גררו להשוואה"
            className="absolute top-1/2 -ml-6 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border-4 border-white bg-terra text-white shadow-xl transition-transform active:scale-95"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 6-6 6 6 6" />
              <path d="m15 6 6 6-6 6" />
            </svg>
          </button>
        </div>
      </div>

      <div className="animate-float absolute -bottom-6 -right-4 rounded-2xl border border-clay/10 bg-sand px-5 py-4 shadow-xl sm:-right-8">
        <p className="font-heading text-2xl font-black text-terra">+2,400</p>
        <p className="text-xs text-clay-soft">בובות נצבעו בבית השנה</p>
      </div>
    </motion.div>
  );
}
