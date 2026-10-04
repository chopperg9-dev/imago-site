import { lazy, Suspense, useState } from "react";
import { motion } from "motion/react";
import { Eraser, Hand, RotateCcw, Sparkles } from "lucide-react";
import { MELANIE, UNPAINTED, type FoxColors, type FoxPart } from "@/components/FoxModel";

const FoxModel = lazy(() => import("@/components/FoxModel"));

const MARKERS = [
  { id: "orange", hex: "#F2762C", name: "כתום שועל" },
  { id: "pink", hex: "#FF2E88", name: "ורוד ניאון" },
  { id: "cyan", hex: "#22E6FF", name: "ציאן" },
  { id: "lime", hex: "#C6FF3D", name: "ליים" },
  { id: "violet", hex: "#9B5CFF", name: "סגול" },
  { id: "cream", hex: "#FBE9D0", name: "שמנת" },
  { id: "brown", hex: "#4A2A1E", name: "שוקולד" },
];

export default function Hero3D() {
  const [colors, setColors] = useState<FoxColors>(UNPAINTED);
  const [marker, setMarker] = useState(MARKERS[0]);
  const [strokes, setStrokes] = useState(0);
  const painted = Object.values(colors).filter((c) => c !== UNPAINTED.head).length;

  const paint = (part: FoxPart) => {
    setColors((c) => ({ ...c, [part]: marker.hex }));
    setStrokes((s) => s + 1);
  };

  return (
    <div className="relative" data-testid="hero-3d-lab">
      <div className="depth-card relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-white/10 sm:aspect-[5/6]">
        <div className="pointer-events-none absolute -top-20 -right-16 h-72 w-72 rounded-full bg-terra/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 h-80 w-80 rounded-full bg-sage/20 blur-3xl" />
        <Suspense fallback={<div className="absolute inset-0 animate-pulse bg-sand" />}>
          <FoxModel colors={colors} onPaint={paint} spinning={strokes === 0} />
        </Suspense>

        <span className="pointer-events-none absolute top-4 right-4 inline-flex items-center gap-1.5 rounded-full bg-ink/80 px-3 py-1.5 text-xs font-semibold text-clay backdrop-blur">
          <Hand className="h-3.5 w-3.5 text-sage" /> גררו לסיבוב · לחצו על חלק כדי לצבוע
        </span>
        <span className="pointer-events-none absolute top-4 left-4 rounded-full bg-terra px-3 py-1.5 text-xs font-bold text-white shadow-[0_0_24px_rgba(255,46,136,0.6)]">
          מלאני · תלת־ממד חי
        </span>

        <div className="absolute inset-x-4 bottom-4 flex flex-col gap-3 rounded-2xl bg-ink/85 p-3 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold text-clay-soft">טוש אקרילי: <span className="text-clay">{marker.name}</span></p>
            <p className="text-xs font-semibold text-clay-soft" data-testid="hero-paint-progress">{painted}/7 חלקים נצבעו</p>
          </div>
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
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.9 }}
                className="relative flex h-10 w-7 items-end justify-center"
              >
                <span className="absolute inset-x-1.5 top-0 h-3 rounded-t-sm" style={{ background: m.hex, filter: "brightness(0.8)" }} />
                <span
                  className={`h-7 w-full rounded-b-md rounded-t-sm transition-shadow ${marker.id === m.id ? "ring-2 ring-white ring-offset-2 ring-offset-ink" : ""}`}
                  style={{ background: m.hex, boxShadow: marker.id === m.id ? `0 0 18px ${m.hex}` : undefined }}
                />
              </motion.button>
            ))}
            <span className="mx-1 h-8 w-px bg-white/10" />
            <button
              type="button"
              data-testid="hero-paint-melanie"
              onClick={() => { setColors(MELANIE); setStrokes((s) => s + 1); }}
              className="inline-flex h-9 items-center gap-1.5 rounded-full border border-sage/40 px-3 text-xs font-bold text-sage-deep transition-colors hover:bg-sage/10"
            >
              <Sparkles className="h-3.5 w-3.5" /> צבעו כמו מלאני
            </button>
            <button
              type="button"
              data-testid="hero-paint-reset"
              onClick={() => { setColors(UNPAINTED); setStrokes(0); }}
              aria-label="נקו את הצבע"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-clay-soft transition-colors hover:border-terra hover:text-terra"
            >
              {painted > 0 ? <Eraser className="h-4 w-4" /> : <RotateCcw className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
