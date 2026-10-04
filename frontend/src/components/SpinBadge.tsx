import { Sparkles } from "lucide-react";

export default function SpinBadge({ className }: { className?: string }) {
  return (
    <div className={className} aria-hidden="true">
      <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-ink/80 backdrop-blur-sm ring-1 ring-white/10">
        <svg viewBox="0 0 100 100" className="animate-spin-slow absolute inset-0 h-full w-full">
          <defs>
            <path id="badge-circle" d="M 50,50 m -37,0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" />
          </defs>
          <text fontSize="10" letterSpacing="2.2" className="fill-clay font-sans font-semibold">
            <textPath href="#badge-circle">IMAGO · COLOR YOUR CHARACTER ·</textPath>
          </text>
        </svg>
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-terra shadow-[0_0_18px_rgba(255,46,136,0.7)]">
          <Sparkles className="h-5 w-5 text-white" />
        </span>
      </div>
    </div>
  );
}
