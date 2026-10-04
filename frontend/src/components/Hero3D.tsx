import { lazy, Suspense, useCallback, useRef, useState } from "react";
import { motion } from "motion/react";
import { Eraser, Hand, Sparkles } from "lucide-react";
import type { FoxApi } from "@/components/FoxModel";

const FoxModel = lazy(() => import("@/components/FoxModel"));

const MARKERS = [
  { id: "orange", hex: "#F2762C", name: "כתום שועל" },
  { id: "blue", hex: "#3D7BFF", name: "כחול חשמלי" },
  { id: "cyan", hex: "#2FD8FF", name: "ציאן" },
  { id: "lime", hex: "#D4FF4A", name: "ליים" },
  { id: "violet", hex: "#9B5CFF", name: "סגול" },
  { id: "cream", hex: "#FBE9D0", name: "שמנת" },
  { id: "brown", hex: "#4A2A1E", name: "שוקולד" },
];

export default function Hero3D() {
  const [marker, setMarker] = useState(MARKERS[0]);
  const [progress, setProgress] = useState(0);
  const api = useRef<FoxApi | null>(null);
  const onProgress = useCallback((r: number) => setProgress(r), []);
  const percent = Math.round(progress * 100);

  return (
    <div className="relative" data-testid="hero-3d-lab">

      <div className="relative aspect-[4/5] sm:aspect-[5/6]">
        <Suspense fallback={<div className="absolute inset-0" />}>
          <FoxModel markerHex={marker.hex} paintable spinning={progress === 0} onProgress={onProgress} apiRef={api} modelScale={1.55} modelY={-0.6} targetY={0.2} />
        </Suspense>
      </div>

      <p className="pointer-events-none absolute top-2 right-0 inline-flex items-center gap-1.5 text-xs font-semibold text-clay-soft">
        <Hand className="h-3.5 w-3.5 text-sage" /> גררו מסביב לסיבוב · ציירו על מלאני עם הטוש
      </p>

      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-3">
        <p className="text-xs font-semibold text-clay-soft">
          טוש אקרילי: <span className="text-clay">{marker.name}</span>
          <span className="mx-2 text-white/20">|</span>
          <span data-testid="hero-paint-progress" className="text-terra-deep">{percent}% מהבובה צבוע</span>
        </p>
        <div className="flex items-center gap-2" role="radiogroup" aria-label="בחירת טוש אקרילי">
          {MARKERS.map((m) => (
            <motion.button
              key={m.id}
              type="button"
              role="radio"
              aria-checked={marker.id === m.id}
              aria-label={m.name}
              data-testid={`marker-${m.id}`}
              onClick={() => setMarker(m)}
              whileHover={{ y: -5, rotate: -6 }}
              whileTap={{ scale: 0.9 }}
              animate={{ y: marker.id === m.id ? -8 : 0 }}
              className="relative flex h-12 w-7 flex-col items-center"
            >
              <span className="h-3 w-3 rounded-t-full" style={{ background: m.hex, filter: "brightness(0.75)" }} />
              <span
                className="h-8 w-5 rounded-b-md"
                style={{ background: m.hex, boxShadow: marker.id === m.id ? `0 0 22px ${m.hex}` : `0 6px 14px -6px ${m.hex}` }}
              />
            </motion.button>
          ))}
          <span className="mx-1 h-8 w-px bg-white/10" />
          <button
            type="button"
            data-testid="hero-paint-melanie"
            onClick={() => api.current?.preset()}
            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-sage/40 px-3 text-xs font-bold text-sage-deep transition-colors hover:bg-sage/10"
          >
            <Sparkles className="h-3.5 w-3.5" /> צבעו כמו מלאני
          </button>
          <button
            type="button"
            data-testid="hero-paint-reset"
            onClick={() => api.current?.reset()}
            aria-label="נקו את הצבע"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-clay-soft transition-colors hover:border-terra hover:text-terra"
          >
            <Eraser className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
