import { lazy, Suspense, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowDown } from "lucide-react";
import { lockScroll } from "@/lib/scrollLock";

const FoxModel = lazy(() => import("@/components/FoxModel"));
const KEY = "imago_intro_seen";

export default function IntroGate() {
  const [open, setOpen] = useState(() => typeof window !== "undefined" && !sessionStorage.getItem(KEY));

  useEffect(() => {
    if (!open) return;
    window.scrollTo(0, 0);
    lockScroll(true);
    return () => lockScroll(false);
  }, [open]);

  const enter = () => {
    sessionStorage.setItem(KEY, "1");
    setOpen(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="gate"
          data-testid="intro-gate"
          className="fixed inset-0 z-[100] flex flex-col overflow-hidden bg-cream"
          exit={{ opacity: 0, scale: 1.08, filter: "blur(12px)" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-terra/25 blur-[140px]" />
          <div className="pointer-events-none absolute left-[30%] top-[65%] h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sage/20 blur-[110px]" />
          <div className="pointer-events-none absolute left-[72%] top-[30%] h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-mustard/10 blur-[100px]" />

          <div className="relative flex items-center justify-between px-6 pt-6 sm:px-10">
            <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="font-heading text-2xl font-black tracking-tight">
              IMAGO<span className="text-terra">.</span>
            </motion.p>
            <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-xs font-semibold tracking-[0.25em] text-clay-soft">
              בובות תלת־ממד לצביעה
            </motion.p>
          </div>

          <div className="relative flex flex-1 flex-col items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              className="h-[46vh] w-full max-w-xl sm:h-[52vh]"
            >
              <Suspense fallback={null}>
                <FoxModel spinning cameraZ={4.0} modelScale={2.1} modelY={-1.05} targetY={0} />
              </Suspense>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="mt-2 text-center font-heading text-4xl font-black leading-tight sm:text-5xl lg:text-6xl"
            >
              היא מגיעה לבנה.
              <br />
              <span className="text-terra drop-shadow-[0_0_28px_rgba(255,46,136,0.6)]">אתם נותנים לה צבע.</span>
            </motion.h1>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9, duration: 0.8 }} className="mt-9 flex flex-col items-center gap-4">
              <motion.button
                type="button"
                onClick={enter}
                data-testid="intro-start-button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative inline-flex items-center gap-3 rounded-full bg-terra px-12 py-5 font-heading text-lg font-black text-white shadow-[0_0_0_1px_rgba(255,46,136,0.5),0_20px_60px_-10px_rgba(255,46,136,0.8)]"
              >
                <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-terra/40" style={{ animationDuration: "2.4s" }} />
                START HERE
                <ArrowDown className="h-5 w-5" />
              </motion.button>
              <p className="text-xs text-clay-soft">גררו את מלאני כדי לסובב אותה · לחצו כדי להיכנס</p>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
