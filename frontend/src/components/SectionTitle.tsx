import { motion } from "motion/react";
import type { ReactNode } from "react";
import { Reveal } from "@/components/Reveal";

export default function SectionTitle({
  kicker,
  title,
  center = false,
}: {
  kicker?: string;
  title: ReactNode;
  center?: boolean;
}) {
  return (
    <Reveal className={center ? "text-center" : ""}>
      {kicker && <p className="text-xs font-bold tracking-[0.25em] text-terra-deep">{kicker}</p>}
      <h2 className="mt-3 font-heading text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">{title}</h2>
      <motion.svg
        viewBox="0 0 220 14"
        aria-hidden="true"
        className={`mt-2 h-3 w-52 text-terra ${center ? "mx-auto" : ""}`}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <motion.path
          d="M4 9 Q 60 2 110 8 T 216 7"
          fill="none"
          stroke="currentColor"
          strokeWidth="5"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay: 0.25, ease: "easeOut" }}
        />
      </motion.svg>
    </Reveal>
  );
}
