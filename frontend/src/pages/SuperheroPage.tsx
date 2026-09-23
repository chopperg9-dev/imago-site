import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Check, ImagePlus, Loader2, RefreshCcw, Shield, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { AnimatePresence, motion } from "motion/react";
import { apiGet, apiPost } from "@/lib/api";
import { useCart } from "@/lib/cart";
import type { SuperheroJob } from "@/lib/types";
import { Reveal } from "@/components/Reveal";

const CAPES = [
  { id: "terracotta", label: "טרקוטה", color: "#C85A32" },
  { id: "sage", label: "מרווה", color: "#5E7A68" },
  { id: "mustard", label: "חרדל", color: "#D9A441" },
  { id: "royal", label: "כחול רויאל", color: "#34558B" },
];

const POSES = [
  { id: "power", label: "עמידת כוח — ידיים על המותן" },
  { id: "fly", label: "תעופה — יד אחת קדימה" },
];

const STAGES = [
  { id: "analyzing", label: "ניתוח התמונות" },
  { id: "sculpting", label: "עיצוב תלת־ממד" },
  { id: "painting", label: "צביעת גיבור־העל" },
];

type Phase = "form" | "processing" | "ready";

export default function SuperheroPage() {
  const navigate = useNavigate();
  const { add } = useCart();
  const [phase, setPhase] = useState<Phase>("form");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [childName, setChildName] = useState("");
  const [cape, setCape] = useState("terracotta");
  const [pose, setPose] = useState("power");
  const [job, setJob] = useState<SuperheroJob | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => previews.forEach((url) => URL.revokeObjectURL(url));
  }, [previews]);

  useEffect(() => {
    if (!job || phase !== "processing") return;
    const timer = setInterval(async () => {
      try {
        const updated = await apiGet<SuperheroJob>(`/superhero/jobs/${job.id}`);
        setJob(updated);
        if (updated.status === "ready") {
          setPhase("ready");
          clearInterval(timer);
        }
        if (updated.status === "failed") {
          toast.error("העיבוד נכשל — נסו שוב עם תמונות אחרות");
          setPhase("form");
          clearInterval(timer);
        }
      } catch {
        // keep polling; transient network hiccup
      }
    }, 2000);
    return () => clearInterval(timer);
  }, [job?.id, phase]);

  const pickFiles = (list: FileList | null) => {
    if (!list) return;
    const next = [...files, ...Array.from(list)].filter((f) => f.type.startsWith("image/")).slice(0, 4);
    setFiles(next);
    setPreviews(next.map((f) => URL.createObjectURL(f)));
  };

  const removeFile = (index: number) => {
    const next = files.filter((_, i) => i !== index);
    setFiles(next);
    setPreviews(next.map((f) => URL.createObjectURL(f)));
  };

  const submit = async () => {
    if (files.length === 0 || !childName.trim()) return;
    setSubmitting(true);
    try {
      const body = new FormData();
      files.forEach((f) => body.append("photos", f));
      body.append("child_name", childName.trim());
      body.append("cape", cape);
      body.append("pose", pose);
      const res = await fetch("/api/superhero/jobs", { method: "POST", body });
      if (!res.ok) throw new Error("upload failed");
      const created = (await res.json()) as SuperheroJob;
      setJob(created);
      setPhase("processing");
      window.scrollTo(0, 0);
    } catch {
      toast.error("ההעלאה נכשלה — בדקו את החיבור ונסו שוב");
    } finally {
      setSubmitting(false);
    }
  };

  const approve = async () => {
    if (!job) return;
    try {
      const approved = await apiPost<SuperheroJob>(`/superhero/jobs/${job.id}/approve`);
      add({
        key: `superhero-${job.id}`,
        name: `גיבור־העל של ${approved.child_name}`,
        price: approved.price,
        image: approved.preview_url ?? "",
        meta: `בובה אישית מהתמונות · גלימה ${CAPES.find((c) => c.id === cape)?.label ?? ""}`,
      });
      toast.success("גיבור־העל האישי נוסף לסל!");
      navigate("/cart");
    } catch {
      toast.error("האישור נכשל — נסו שוב");
    }
  };

  const restart = () => {
    setFiles([]);
    setPreviews([]);
    setJob(null);
    setPhase("form");
    window.scrollTo(0, 0);
  };

  return (
    <div data-testid="superhero-page" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
      <Reveal className="mx-auto max-w-2xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-terra/30 bg-terra-soft px-4 py-1.5 text-xs font-semibold text-terra-deep">
          <Shield className="h-3.5 w-3.5" /> הדפסה אישית · ₪349
        </span>
        <h1 className="mt-5 font-heading text-4xl font-black leading-tight sm:text-5xl">
          הילד שלכם הופך <span className="text-terra">לגיבור־על</span>
        </h1>
        <p className="mt-5 text-sm leading-8 text-clay-soft">
          מעלים כמה תמונות פנים, בוחרים גלימה ותנוחה, ורואים על המסך איך הבובה האישית תיראה — רק אחרי
          שאישרתם את התצוגה, אנחנו מדפיסים.
        </p>
      </Reveal>

      <AnimatePresence mode="wait">
        {phase === "form" && (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.5 }}
            className="mx-auto mt-14 grid max-w-4xl grid-cols-1 gap-8 lg:grid-cols-12"
          >
            <div className="lg:col-span-7">
              <div
                onClick={() => inputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  pickFiles(e.dataTransfer.files);
                }}
                data-testid="superhero-dropzone"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
                className="flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-clay/25 bg-white px-6 py-14 text-center transition-all hover:border-terra hover:bg-terra-soft/40"
              >
                <ImagePlus className="h-10 w-10 text-terra" />
                <p className="mt-4 font-heading text-lg font-bold">גוררים לכאן תמונות או לוחצים לבחירה</p>
                <p className="mt-2 text-xs text-clay-soft">1–4 תמונות · עד 8MB לתמונה · JPG או PNG</p>
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  data-testid="superhero-upload-input"
                  className="hidden"
                  onChange={(e) => pickFiles(e.target.files)}
                />
              </div>

              {previews.length > 0 && (
                <div className="mt-5 grid grid-cols-4 gap-3" data-testid="superhero-photo-previews">
                  {previews.map((src, i) => (
                    <div key={src} className="relative aspect-square overflow-hidden rounded-2xl border border-clay/10">
                      <img src={src} alt={`תמונה ${i + 1}`} className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        data-testid={`remove-photo-${i}`}
                        aria-label={`הסרת תמונה ${i + 1}`}
                        className="absolute top-1.5 left-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-ink/70 text-white"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 rounded-2xl bg-sage-soft p-5">
                <p className="flex items-center gap-2 text-xs font-bold text-sage-deep">
                  <Camera className="h-4 w-4" /> טיפים לתמונה מושלמת
                </p>
                <ul className="mt-3 space-y-1.5 text-xs leading-6 text-sage-deep/90">
                  <li>· תמונת פנים ברורה, מול המצלמה, בתאורה טובה</li>
                  <li>· בלי משקפי שמש, כובע או פילטרים</li>
                  <li>· עדיף 2–3 תמונות מזוויות קצת שונות</li>
                </ul>
              </div>
            </div>

            <div className="space-y-6 lg:col-span-5">
              <div className="rounded-3xl border border-clay/10 bg-white p-6">
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold">שם הילד או הילדה</span>
                  <input
                    value={childName}
                    onChange={(e) => setChildName(e.target.value)}
                    data-testid="superhero-name-input"
                    className="w-full rounded-2xl border border-clay/15 bg-cream px-4 py-3 text-sm outline-none transition-all placeholder:text-clay/35 focus:border-terra focus:ring-2 focus:ring-terra/20"
                    placeholder="למשל: יוון"
                  />
                </label>

                <p className="mt-6 mb-3 text-xs font-semibold">צבע הגלימה</p>
                <div className="flex gap-3" role="radiogroup" aria-label="צבע גלימה">
                  {CAPES.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      role="radio"
                      aria-checked={cape === c.id}
                      data-testid={`cape-color-${c.id}`}
                      onClick={() => setCape(c.id)}
                      title={c.label}
                      className={`flex h-11 w-11 items-center justify-center rounded-full border-2 transition-all active:scale-90 ${
                        cape === c.id ? "border-clay" : "border-transparent"
                      }`}
                    >
                      <span
                        className="flex h-8 w-8 items-center justify-center rounded-full"
                        style={{ backgroundColor: c.color }}
                      >
                        {cape === c.id && <Check className="h-4 w-4 text-white" />}
                      </span>
                    </button>
                  ))}
                </div>

                <p className="mt-6 mb-3 text-xs font-semibold">תנוחה</p>
                <div className="space-y-2" role="radiogroup" aria-label="תנוחה">
                  {POSES.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      role="radio"
                      aria-checked={pose === p.id}
                      data-testid={`pose-${p.id}`}
                      onClick={() => setPose(p.id)}
                      className={`block w-full rounded-2xl border-2 px-4 py-3 text-right text-xs font-medium transition-all ${
                        pose === p.id ? "border-terra bg-terra-soft text-terra-deep" : "border-clay/10 bg-cream hover:border-terra/40"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={submit}
                  disabled={files.length === 0 || !childName.trim() || submitting}
                  data-testid="superhero-submit-button"
                  className="mt-7 flex w-full items-center justify-center gap-2 rounded-full bg-terra py-4 text-sm font-bold text-white transition-all hover:bg-terra-dark active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  {submitting ? "מעלים תמונות…" : "יוצרים את גיבור־העל"}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {phase === "processing" && job && (
          <motion.div
            key="processing"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.5 }}
            className="mx-auto mt-14 max-w-xl text-center"
            data-testid="superhero-processing"
          >
            <div className="relative mx-auto flex h-28 w-28 items-center justify-center">
              <div className="absolute inset-0 animate-spin-slow rounded-full border-2 border-dashed border-terra/50" />
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-terra-soft">
                <Shield className="h-9 w-9 text-terra" />
              </div>
            </div>
            <h2 className="mt-8 font-heading text-2xl font-black" data-testid="superhero-stage-label">
              {job.stage_label}
            </h2>
            <p className="mt-2 text-xs text-clay-soft">הקסם לוקח כמה רגעים — אפשר להישאר בעמוד</p>

            <div className="mt-8 h-2.5 overflow-hidden rounded-full bg-sand">
              <div
                className="h-full rounded-full bg-terra transition-all duration-1000 ease-out"
                style={{ width: `${job.progress}%` }}
                data-testid="superhero-progress-bar"
              />
            </div>
            <p className="mt-2 text-xs font-bold text-terra">{job.progress}%</p>

            <ol className="mt-10 space-y-3 text-right">
              {STAGES.map((stage, i) => {
                const stageIndex = STAGES.findIndex((s) => s.id === job.stage);
                const done = stageIndex > i;
                const currentStage = stageIndex === i;
                return (
                  <li
                    key={stage.id}
                    className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition-all ${
                      currentStage ? "border-terra bg-terra-soft font-bold text-terra-deep" : done ? "border-sage/30 bg-sage-soft text-sage-deep" : "border-clay/10 bg-white text-clay-soft"
                    }`}
                  >
                    <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-black ${done ? "bg-sage text-white" : currentStage ? "bg-terra text-white" : "bg-sand text-clay-soft"}`}>
                      {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
                    </span>
                    {stage.label}
                    {currentStage && <Loader2 className="mr-auto h-4 w-4 animate-spin text-terra" />}
                  </li>
                );
              })}
            </ol>
          </motion.div>
        )}

        {phase === "ready" && job?.preview_url && (
          <motion.div
            key="ready"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto mt-14 max-w-3xl"
            data-testid="superhero-preview-ready"
          >
            <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-2">
              <div className="overflow-hidden rounded-[2rem] border border-clay/10 bg-stage shadow-2xl">
                <img
                  src={job.preview_url}
                  alt={`תצוגה מקדימה של גיבור־העל של ${job.child_name}`}
                  className="aspect-[4/5] w-full object-cover"
                  data-testid="superhero-preview-image"
                />
              </div>
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-sage-soft px-4 py-1.5 text-xs font-bold text-sage-deep">
                  <Check className="h-3.5 w-3.5" /> התצוגה מוכנה
                </span>
                <h2 className="mt-5 font-heading text-3xl font-black leading-tight">
                  הכירו: גיבור־העל של {job.child_name}
                </h2>
                <p className="mt-4 text-sm leading-8 text-clay-soft">
                  זו הדמיית כיוון עיצובי — הבובה הסופית מודפסת בלבן ומצוירת ביד בסטודיו בהשראת העיצוב
                  שאישרתם. אהבתם? אשרו ונתחיל בהדפסה.
                </p>
                <p className="mt-4 font-heading text-2xl font-black text-terra">₪{job.price}</p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={approve}
                    data-testid="superhero-approve-button"
                    className="inline-flex items-center gap-2 rounded-full bg-terra px-8 py-4 text-sm font-bold text-white transition-all hover:bg-terra-dark active:scale-95"
                  >
                    <Check className="h-4 w-4" /> מאושר — להוספה לסל
                  </button>
                  <button
                    type="button"
                    onClick={restart}
                    data-testid="superhero-retry-button"
                    className="inline-flex items-center gap-2 rounded-full border-2 border-clay/20 px-8 py-[14px] text-sm font-bold transition-all hover:border-terra hover:text-terra active:scale-95"
                  >
                    <RefreshCcw className="h-4 w-4" /> נסו עם תמונות אחרות
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
