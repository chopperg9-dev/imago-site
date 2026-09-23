import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Leaf, Palette, Shield, Sparkles, Star, Truck } from "lucide-react";
import { apiGet } from "@/lib/api";
import type { Product } from "@/lib/types";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";
import MagneticButton from "@/components/MagneticButton";
import Marquee from "@/components/Marquee";
import PaintTrail from "@/components/PaintTrail";
import ProductCard from "@/components/ProductCard";
import SectionTitle from "@/components/SectionTitle";
import SpinBadge from "@/components/SpinBadge";
import { FadeIn, HeroLine, Reveal } from "@/components/Reveal";

const SUPERHERO_SAMPLE =
  "https://static.prod-images.emergentagent.com/jobs/4ce74442-beb6-4a2a-a71b-521399fd659c/images/0a019b44080bff0b28e026f8bccf8901f0da59c3746aaa5f3f34ded03304d4c4.jpeg";

const CHAPTERS = [
  {
    num: "01",
    title: "בוחרים בובה",
    text: "כל בובה מודפסת אצלנו בסטודיו בתל־אביב מ־PLA אקולוגי, ומגיעה לבנה ומוכנה — כמו דף חלק.",
  },
  {
    num: "02",
    title: "צובעים בבית",
    text: "פותחים את ערכת הצבעים והמכחולים שמצורפת, ונותנים לדמיון לעבוד. אין כללים, יש רק צבע.",
  },
  {
    num: "03",
    title: "מתגאים במדף",
    text: "בובה אחת שלא דומה לאף בובה בעולם — יצירת אמנות קטנה בחתימה של הילד או הילדה.",
  },
];

const TESTIMONIALS = [
  {
    quote: "מאיה בת ה־6 לא הפסיקה לצבוע שעתיים. הבובה עומדת לה על המדף כמו גביע.",
    name: "דנה, תל־אביב",
  },
  {
    quote: "הזמנו גיבור־על מהתמונות של יוון — הוא צחק עשר דקות רצוף כשהוא ראה את עצמו.",
    name: "אבי, חיפה",
  },
  {
    quote: "פעילות יום־הולדת מושלמת: עשר בובות לבנות, הרבה צבע, ואפילו קצת שקט.",
    name: "מיכל, רמת־גן",
  },
];

export default function Home() {
  const { data: products } = useQuery({
    queryKey: ["products"],
    queryFn: () => apiGet<Product[]>("/products"),
  });
  const shelf = [...(products ?? [])].sort((a, b) => Number(b.featured) - Number(a.featured));

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const visualY = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const watermarkX = useTransform(scrollYProgress, [0, 1], [0, -280]);

  return (
    <div data-testid="home-page">
      <section ref={heroRef} className="relative overflow-hidden">
        <motion.p
          aria-hidden="true"
          style={{ x: watermarkX }}
          className="text-outline pointer-events-none absolute top-4 right-0 z-0 select-none whitespace-nowrap font-heading text-[24vw] leading-none"
        >
          IMAGO
        </motion.p>
        <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-terra-soft blur-3xl" />
        <div className="pointer-events-none absolute top-40 -right-32 h-80 w-80 rounded-full bg-sage-soft blur-3xl" />

        <PaintTrail className="relative">
          <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 px-4 pt-14 pb-24 sm:px-6 lg:grid-cols-12 lg:gap-10 lg:px-8 lg:pt-20 lg:pb-32">
            <motion.div style={{ y: textY }} className="lg:col-span-6">
              <FadeIn>
                <span className="inline-flex -rotate-2 items-center gap-2 rounded-full border border-terra/30 bg-terra-soft px-4 py-1.5 text-xs font-semibold text-terra-deep shadow-sm">
                  <Sparkles className="h-3.5 w-3.5" />
                  בובות הדפסה תלת־ממדית לצביעה בבית
                </span>
              </FadeIn>

              <h1 className="mt-7 font-heading text-4xl font-black leading-[1.12] tracking-tight sm:text-5xl lg:text-6xl">
                <HeroLine delay={0.15}>כל בובה לבנה</HeroLine>
                <HeroLine delay={0.3}>היא סיפור קטן</HeroLine>
                <HeroLine delay={0.45}>
                  שמחכה <span className="text-terra">לצבע.</span>
                </HeroLine>
              </h1>

              <FadeIn delay={0.7}>
                <p className="mt-7 max-w-xl text-base leading-8 text-clay-soft sm:text-lg sm:leading-9">
                  ב־IMAGO אנחנו מדפיסים בובות דמויות ויניל מ־PLA אקולוגי ושולחים אותן הביתה עם צבעי
                  אקריליק בטוחים ומכחולים — והילדים הופכים אותן ליצירת אמנות שאין לאף אחד אחר.
                </p>
              </FadeIn>

              <FadeIn delay={0.85}>
                <div className="mt-9 flex flex-wrap items-center gap-5">
                  <MagneticButton>
                    <Link
                      to="/shop"
                      data-testid="hero-shop-cta"
                      className="group inline-flex items-center gap-2 rounded-full bg-terra px-8 py-4 text-sm font-bold text-white transition-colors hover:bg-terra-dark active:scale-95"
                    >
                      לחנות הבובות
                      <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                    </Link>
                  </MagneticButton>
                  <MagneticButton>
                    <Link
                      to="/superhero"
                      data-testid="hero-superhero-cta"
                      className="inline-flex items-center gap-2 rounded-full border-2 border-clay px-8 py-[14px] text-sm font-bold transition-colors hover:border-terra hover:text-terra active:scale-95"
                    >
                      <Shield className="h-4 w-4" />
                      גיבור־העל האישי
                    </Link>
                  </MagneticButton>
                </div>
              </FadeIn>

              <FadeIn delay={1}>
                <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-xs font-medium text-clay-soft">
                  <span className="inline-flex items-center gap-1.5"><Leaf className="h-4 w-4 text-sage" /> PLA אקולוגי ובטוח</span>
                  <span className="inline-flex items-center gap-1.5"><Palette className="h-4 w-4 text-terra" /> כולל ערכת צבעים</span>
                  <span className="inline-flex items-center gap-1.5"><Truck className="h-4 w-4 text-mustard" /> משלוח חינם מעל ₪199</span>
                </div>
              </FadeIn>
            </motion.div>

            <motion.div
              style={{ y: visualY }}
              initial={{ opacity: 0, scale: 0.94, rotate: -3 }}
              animate={{ opacity: 1, scale: 1, rotate: -1.5 }}
              transition={{ duration: 1.1, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ rotate: 0 }}
              className="relative lg:col-span-6"
            >
              <BeforeAfterSlider />
              <SpinBadge className="absolute -top-7 -left-4 z-20 hidden sm:block" />
              <span className="animate-float absolute -bottom-5 left-10 z-20 rotate-3 rounded-full bg-mustard px-4 py-2 text-xs font-bold text-ink shadow-lg">
                זזו עם העכבר — הצבע עף
              </span>
            </motion.div>
          </div>
        </PaintTrail>
      </section>

      <Marquee />

      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32" aria-labelledby="how-title">
        <SectionTitle kicker="איך זה עובד" title={<span id="how-title">שלושה צעדים ליצירת מופת</span>} />
        <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-3">
          {CHAPTERS.map((chapter, i) => (
            <Reveal key={chapter.num} delay={i * 0.15}>
              <div
                className={`group relative h-full rounded-3xl border border-clay/10 bg-white p-8 transition-all duration-300 hover:-translate-y-2 hover:rotate-0 hover:shadow-xl ${
                  i % 2 === 0 ? "-rotate-1" : "rotate-1"
                }`}
              >
                <p className="text-outline-terra font-heading text-7xl font-black transition-all duration-300 group-hover:scale-110">
                  {chapter.num}
                </p>
                <h3 className="mt-5 font-heading text-xl font-bold">{chapter.title}</h3>
                <p className="mt-3 text-sm leading-7 text-clay-soft">{chapter.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <ProductShelf products={shelf} />

      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8 lg:pb-32">
        <Reveal>
          <div className="grid grid-cols-1 items-center gap-10 overflow-hidden rounded-[2.5rem] bg-ink p-8 text-[#F7F3EE] sm:p-12 lg:grid-cols-2 lg:p-16">
            <div>
              <p className="text-xs font-bold tracking-[0.2em] text-[#E48766]">חוויית ההתאמה האישית</p>
              <h2 className="mt-4 font-heading text-3xl font-black leading-tight sm:text-4xl">
                הילד שלכם.
                <br />
                <span className="text-[#E48766]">כגיבור־על.</span>
              </h2>
              <p className="mt-6 max-w-md text-sm leading-8 text-[#B5A79E]">
                מעלים כמה תמונות של הילד או הילדה, בוחרים חליפה וגלימה — ותוך דקות רואים על המסך
                תצוגה מקדימה של הבובה האישית. מאשרים, ואנחנו מדפיסים ושולחים עד הבית.
              </p>
              <ul className="mt-8 space-y-3 text-sm">
                {["מעלים 1–4 תמונות פנים", "בוחרים צבע גלימה ותנוחה", "מאשרים תצוגה מקדימה", "מקבלים בובה אחת ויחידה"].map(
                  (step, i) => (
                    <li key={step} className="flex items-center gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#E48766]/15 font-heading text-xs font-black text-[#E48766]">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  )
                )}
              </ul>
              <Link
                to="/superhero"
                data-testid="superhero-band-cta"
                className="mt-10 inline-flex items-center gap-2 rounded-full bg-terra px-8 py-4 text-sm font-bold text-white transition-all hover:bg-terra-dark active:scale-95"
              >
                יוצרים גיבור־על <ArrowLeft className="h-4 w-4" />
              </Link>
            </div>
            <div className="relative">
              <div className="pointer-events-none absolute inset-0 -z-0 rounded-full bg-[#E48766]/10 blur-3xl" />
              <img
                src={SUPERHERO_SAMPLE}
                alt="בובת גיבור־על אישית צבועה"
                loading="lazy"
                className="relative mx-auto aspect-[4/5] w-full max-w-sm rounded-[2rem] border border-white/10 object-cover shadow-2xl"
              />
              <span className="absolute bottom-5 right-5 rounded-full bg-white/95 px-4 py-2 text-xs font-bold text-clay shadow-lg">
                תצוגה מקדימה אמיתית מהאתר
              </span>
            </div>
          </div>
        </Reveal>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8 lg:pb-32" aria-labelledby="testimonials-title">
        <SectionTitle center title={<span id="testimonials-title">משפחות שכבר צבעו</span>} />
        <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.12}>
              <figure className="flex h-full flex-col rounded-3xl border border-clay/10 bg-white p-8">
                <div className="flex gap-1 text-mustard" aria-hidden="true">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <blockquote className="mt-5 flex-1 text-sm leading-8 text-clay">{t.quote}</blockquote>
                <figcaption className="mt-6 text-xs font-bold text-clay-soft">{t.name}</figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-sage-soft">
        <div className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <Reveal>
            <h2 className="font-heading text-3xl font-black sm:text-4xl">מוכנים להוציא את הצבעים?</h2>
            <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-clay-soft">
              בובה אחת, ערכת צבעים אחת, ושעה של שקט יצירתי לכל המשפחה.
            </p>
            <Link
              to="/shop"
              data-testid="bottom-cta-shop"
              className="mt-9 inline-flex items-center gap-2 rounded-full bg-clay px-10 py-4 text-sm font-bold text-cream transition-all hover:bg-terra active:scale-95"
            >
              מתחילים לצבוע <ArrowLeft className="h-4 w-4" />
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

function ProductShelf({ products }: { products: Product[] }) {
  const targetRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDesktop, setIsDesktop] = useState(false);
  const [distance, setDistance] = useState(0);

  useEffect(() => {
    const measure = () => {
      setIsDesktop(window.innerWidth >= 1024);
      if (trackRef.current) {
        setDistance(Math.max(0, trackRef.current.scrollWidth - window.innerWidth + 96));
      }
    };
    measure();
    const timer = setTimeout(measure, 600);
    window.addEventListener("resize", measure);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", measure);
    };
  }, [products]);

  const { scrollYProgress } = useScroll({ target: targetRef, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], [0, distance]);

  const header = (
    <div className="flex items-end justify-between gap-6 px-4 sm:px-6 lg:px-8">
      <SectionTitle kicker="החנות" title="גללו — המדף זז" />
      <Link
        to="/shop"
        data-testid="shelf-all-products-link"
        className="hidden shrink-0 items-center gap-2 pb-2 text-sm font-bold text-terra transition-colors hover:text-terra-dark sm:inline-flex"
      >
        לכל הבובות <ArrowLeft className="h-4 w-4" />
      </Link>
    </div>
  );

  const row = (
    <motion.div
      ref={trackRef}
      style={isDesktop ? { x } : undefined}
      className="mt-12 flex w-full snap-x gap-6 overflow-x-auto px-4 pb-6 sm:px-6 lg:w-max lg:gap-8 lg:overflow-visible lg:px-8"
    >
      {products.map((product) => (
        <div key={product.id} className="w-72 shrink-0 snap-start sm:w-80">
          <ProductCard product={product} />
        </div>
      ))}
      <Link
        to="/shop"
        className="flex w-56 shrink-0 snap-start flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed border-terra/40 bg-terra-soft/50 text-center transition-all hover:-translate-y-2 hover:border-terra"
      >
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-terra text-white">
          <ArrowLeft className="h-6 w-6" />
        </span>
        <span className="font-heading text-xl font-bold text-terra-deep">לכל הבובות</span>
      </Link>
    </motion.div>
  );

  if (!isDesktop) {
    return (
      <section className="mx-auto max-w-7xl py-16" aria-label="מדף הבובות">
        {header}
        {row}
      </section>
    );
  }

  return (
    <section ref={targetRef} className="relative h-[280vh]" aria-label="מדף הבובות">
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        {header}
        {row}
      </div>
    </section>
  );
}
