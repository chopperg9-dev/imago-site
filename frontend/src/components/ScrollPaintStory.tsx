import { useRef } from "react";
import { motion, useMotionTemplate, useSpring, useTransform, useScroll } from "motion/react";

const BEFORE =
  "https://static.prod-images.emergentagent.com/jobs/4ce74442-beb6-4a2a-a71b-521399fd659c/images/aec5b7a3e4ce32fdab65bb47b4352ba3effd1f52422a0d78b56311e31281ae73.jpeg";
const AFTER =
  "https://static.prod-images.emergentagent.com/jobs/4ce74442-beb6-4a2a-a71b-521399fd659c/images/d672d9ea803540f358674dfcc38d49970a87f7932571b56acfc4cac3cd0af2eb.jpeg";

const CHAPTERS = [
  { num: "01", title: "מגיעה לבנה", text: "בובה חלקה מ־PLA אקולוגי, מחכה לידיים קטנות וסקרניות." },
  { num: "02", title: "מקבלת צבע", text: "מכחול ראשון נוגע — וכל החדר מסתובב סביבה." },
  { num: "03", title: "הופכת למלאני", text: "אחת ויחידה. שלכם. לתמיד." },
];

export default function ScrollPaintStory() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const smooth = useSpring(scrollYProgress, { stiffness: 90, damping: 26, mass: 0.6 });

  const paint = useTransform(smooth, [0.08, 0.72], [100, 0]);
  const clip = useMotionTemplate`inset(0 ${paint}% 0 0)`;
  const edge = useMotionTemplate`${paint}%`;

  const percent = useTransform(smooth, [0.08, 0.72], [0, 100]);
  const percentText = useTransform(percent, (v) => `${Math.round(v)}%`);

  const bg = useTransform(smooth, [0, 0.5, 1], ["#FAF7F2", "#F5EEE3", "#FBEBE4"]);
  const imageScale = useTransform(smooth, [0, 1], [1, 1.06]);

  return (
    <section ref={ref} data-testid="scroll-paint-story" className="relative h-[360vh]" aria-label="סיפור הצביעה">
      <motion.div style={{ backgroundColor: bg }} className="sticky top-0 flex h-screen items-center overflow-hidden">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
          <div className="relative order-2 h-64 lg:order-1 lg:h-96">
            {CHAPTERS.map((chapter, i) => (
              <Chapter key={chapter.num} chapter={chapter} index={i} progress={smooth} />
            ))}
            <p className="absolute -bottom-10 right-0 text-xs font-bold tracking-[0.25em] text-terra-deep lg:-bottom-14">
              גללו כדי לצבוע
            </p>
          </div>

          <div className="relative order-1 lg:order-2">
            <motion.div
              style={{ scale: imageScale }}
              className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-[2rem] border border-clay/10 shadow-[0_40px_90px_-30px_rgba(44,34,30,0.4)]"
            >
              <img src={BEFORE} alt="מלאני לפני צביעה" className="absolute inset-0 h-full w-full object-cover" draggable={false} />
              <motion.img
                src={AFTER}
                alt="מלאני אחרי צביעה"
                className="absolute inset-0 h-full w-full object-cover"
                style={{ clipPath: clip }}
                draggable={false}
              />
              <motion.div aria-hidden="true" className="absolute inset-y-0 z-10 w-[3px] bg-white shadow-[0_0_16px_rgba(255,255,255,0.9)]" style={{ right: edge }} />
            </motion.div>

            <motion.p
              aria-hidden="true"
              className="text-outline-terra pointer-events-none absolute -bottom-8 left-2 select-none font-heading text-7xl font-black sm:text-8xl lg:-left-4"
            >
              <motion.span>{percentText}</motion.span>
            </motion.p>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function Chapter({
  chapter,
  index,
  progress,
}: {
  chapter: { num: string; title: string; text: string };
  index: number;
  progress: ReturnType<typeof useSpring>;
}) {
  const windows = [
    [0.0, 0.08, 0.26, 0.34],
    [0.34, 0.44, 0.56, 0.64],
    [0.64, 0.76, 0.94, 1.0],
  ];
  const [a, b, c, d] = windows[index];
  const opacity = useTransform(progress, [a, b, c, d], index === 0 ? [1, 1, 1, 0] : [0, 1, 1, 0]);
  const y = useTransform(progress, [a, b, c, d], index === 0 ? [0, 0, 0, -40] : [40, 0, 0, -40]);

  return (
    <motion.div style={{ opacity, y }} className="absolute inset-x-0 top-0">
      <p className="text-outline font-heading text-6xl font-black leading-none sm:text-7xl">{chapter.num}</p>
      <h3 className="mt-4 font-heading text-3xl font-black sm:text-4xl">{chapter.title}</h3>
      <p className="mt-3 max-w-sm text-sm leading-8 text-clay-soft sm:text-base">{chapter.text}</p>
    </motion.div>
  );
}
