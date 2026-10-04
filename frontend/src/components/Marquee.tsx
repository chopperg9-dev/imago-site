import { motion, useScroll, useSpring, useTransform, useVelocity } from "motion/react";

const ITEMS = [
  "מודפס באהבה בתל־אביב",
  "PLA אקולוגי וידידותי",
  "טושים אקריליים בטוחים לילדים",
  "משלוח חינם מעל ₪199",
  "גיבור־על אישי מהתמונה",
  "מתנה שלא שוכחים",
];

export default function Marquee() {
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const skewX = useSpring(useTransform(velocity, [-1200, 1200], [4, -4]), { stiffness: 140, damping: 22 });

  const row = (
    <>
      {ITEMS.map((item) => (
        <span key={item} className="mx-6 flex items-center gap-6 whitespace-nowrap">
          <span className="font-heading text-lg text-clay/80">{item}</span>
          <span className="text-terra" aria-hidden="true">✺</span>
        </span>
      ))}
    </>
  );
  return (
    <div dir="ltr" className="overflow-hidden border-y border-white/10 bg-sand py-4 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]" aria-hidden="true">
      <motion.div className="animate-marquee flex w-max hover:[animation-play-state:paused]" style={{ direction: "ltr", skewX }}>
        <div className="flex">{row}</div>
        <div className="flex">{row}</div>
      </motion.div>
    </div>
  );
}
