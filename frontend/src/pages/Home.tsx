import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Highlighter, Leaf, Shield, Sparkles, Star, Truck } from "lucide-react";
import { apiGet } from "@/lib/api";
import type { Product } from "@/lib/types";
import Hero3D from "@/components/Hero3D";
import IntroGate from "@/components/IntroGate";
import ScrollMarker from "@/components/ScrollMarker";
import MagneticButton from "@/components/MagneticButton";
import PaintTrail from "@/components/PaintTrail";
import ProductCard from "@/components/ProductCard";
import ScrollPaintStory from "@/components/ScrollPaintStory";
import SectionTitle from "@/components/SectionTitle";
import SpinBadge from "@/components/SpinBadge";
import TiltCard from "@/components/TiltCard";
import { FadeIn, HeroLine, Reveal } from "@/components/Reveal";

const IMG = "https://static.prod-images.emergentagent.com/jobs/4ce74442-beb6-4a2a-a71b-521399fd659c/images";
const SUPERHERO_SAMPLE = `${IMG}/d936f2e98a27acd331455e17d71e691ed48b3f925aad516d019a9344e562e99b.jpeg`;
const KIT_FLOAT = `${IMG}/450ca9ca5cfe3f0e88db0ba161549722ad65480ff21b93bbdd3914fcf93b6721.jpeg`;
const KID_MARKERS = `${IMG}/d45dc3bc2f12b602504796f2efa3732142652eca7c4c1f92eb84de175725abb5.jpeg`;

const TESTIMONIALS = [
  { quote: "מאיה בת ה־6 לא הפסיקה לצבוע שעתיים. הבובה עומדת לה על המדף כמו גביע.", name: "דנה, תל־אביב" },
  { quote: "הזמנו גיבור־על מהתמונות של יוון — הוא צחק עשר דקות רצוף כשהוא ראה את עצמו.", name: "אבי, חיפה" },
  { quote: "פעילות יום־הולדת מושלמת: עשר בובות לבנות, הרבה טושים, ואפילו קצת שקט.", name: "מיכל, רמת־גן" },
];

export default function Home() {
  const { data: products } = useQuery({ queryKey: ["products"], queryFn: () => apiGet<Product[]>("/products") });
  const shelf = [...(products ?? [])].sort((a, b) => Number(b.featured) - Number(a.featured));

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const visualY = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, -50]);

  return (
    <div data-testid="home-page">
      <IntroGate />
      <ScrollMarker />
      <section ref={heroRef} className="relative overflow-hidden">

        <PaintTrail className="relative">
          <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 px-4 pt-14 pb-24 sm:px-6 lg:grid-cols-12 lg:gap-10 lg:px-8 lg:pt-20 lg:pb-32">
            <motion.div style={{ y: textY }} className="lg:col-span-6">
              <FadeIn>
                <span className="inline-flex -rotate-2 items-center gap-2 rounded-full border border-terra/40 bg-terra-soft px-4 py-1.5 text-xs font-semibold text-terra-deep">
                  <Sparkles className="h-3.5 w-3.5" />
                  בובות תלת־ממד לצביעה בטושים אקריליים
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
                  ב־IMAGO אנחנו מדפיסים בובות בתלת־ממד מ־PLA אקולוגי ושולחים אותן הביתה לבנות, עם ערכת טושים
                  אקריליים בטוחים — והילדים הופכים אותן ליצירת אמנות שאין לאף אחד אחר.
                </p>
              </FadeIn>

              <FadeIn delay={0.85}>
                <div className="mt-9 flex flex-wrap items-center gap-5">
                  <MagneticButton>
                    <Link to="/shop" data-testid="hero-shop-cta" className="group inline-flex items-center gap-2 rounded-full bg-terra px-8 py-4 text-sm font-bold text-white transition-colors hover:bg-terra-dark active:scale-95">
                      לחנות הבובות
                      <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                    </Link>
                  </MagneticButton>
                  <MagneticButton>
                    <Link to="/superhero" data-testid="hero-superhero-cta" className="inline-flex items-center gap-2 rounded-full border-2 border-clay/70 px-8 py-[14px] text-sm font-bold transition-colors hover:border-sage hover:text-sage active:scale-95">
                      <Shield className="h-4 w-4" />
                      גיבור־העל האישי
                    </Link>
                  </MagneticButton>
                </div>
              </FadeIn>

              <FadeIn delay={1}>
                <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-xs font-medium text-clay-soft">
                  <span className="inline-flex items-center gap-1.5"><Leaf className="h-4 w-4 text-mustard" /> PLA אקולוגי ובטוח</span>
                  <span className="inline-flex items-center gap-1.5"><Highlighter className="h-4 w-4 text-terra" /> כולל טושים אקריליים</span>
                  <span className="inline-flex items-center gap-1.5"><Truck className="h-4 w-4 text-sage" /> משלוח חינם מעל ₪199</span>
                </div>
              </FadeIn>
            </motion.div>

            <motion.div
              style={{ y: visualY }}
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.1, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="relative lg:col-span-6"
            >
              <Hero3D />
              <SpinBadge className="absolute -top-7 -left-4 z-20 hidden sm:block" />
              
            </motion.div>
          </div>
        </PaintTrail>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32" aria-labelledby="kit-title">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <p className="text-xs font-bold tracking-[0.25em] text-sage-deep">הערכה</p>
            <h2 id="kit-title" className="mt-3 font-heading text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">טושים אקריליים.<br />לא מכחולים.</h2>
            <p className="mt-6 max-w-md text-sm leading-8 text-clay-soft sm:text-base">
              צובעים ישר על הבובה כמו עם טוש — בלי כוסות מים, בלי פלטה ובלי כתמים על השולחן. הצבע האקרילי מתייבש תוך דקות, לא נמרח, ונשאר על הבובה לתמיד.
            </p>
            <ul className="mt-8 grid grid-cols-2 gap-3 text-sm">
              {["בטוח לילדים מגיל 5", "מתייבש תוך 3 דקות", "צבע אטום בשכבה אחת", "חוד עדין לפרטים קטנים"].map((item) => (
                <li key={item} className="flex items-center gap-2 text-clay"><span className="h-1.5 w-1.5 rounded-full bg-sage" />{item}</li>
              ))}
            </ul>
          </Reveal>
          <div className="relative lg:col-span-7">
            <Reveal>
              <TiltCard className="group" max={8}>
                <img
                  src={KIT_FLOAT}
                  alt="מלאני הלבנה מוקפת בטושים אקריליים מרחפים"
                  loading="lazy"
                  data-testid="kit-image"
                  className="aspect-[4/5] w-full object-cover [mask-image:radial-gradient(ellipse_at_center,black_58%,transparent_82%)] transition-transform duration-700 group-hover:scale-105"
                  style={{ transform: "translateZ(40px)" }}
                />
              </TiltCard>
            </Reveal>
            <Reveal delay={0.2} className="absolute -bottom-6 -left-2 w-36 sm:w-48 lg:-left-6">
              <img src={KID_MARKERS} alt="ילד צובע את דני הדינוזאור בטוש אקרילי ירוק" loading="lazy" data-testid="kit-kid-image" className="aspect-[4/5] w-full rotate-3 rounded-[2.5rem] object-cover shadow-[0_40px_80px_-30px_rgba(0,0,0,0.9)]" />
            </Reveal>
          </div>
        </div>
      </section>

      <ProductShelf products={shelf} />

      <ScrollPaintStory />

      <section data-testid="superhero-band" className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8 lg:pb-32">
        <Reveal>
          <div className="relative grid grid-cols-1 items-center gap-10 text-clay lg:grid-cols-2">
            <div>
              <p className="text-xs font-bold tracking-[0.2em] text-sage">חוויית ההתאמה האישית</p>
              <h2 className="mt-4 font-heading text-3xl font-black leading-tight sm:text-4xl">
                הילד שלכם.
                <br />
                <span className="text-sage">כגיבור־על.</span>
              </h2>
              <p className="mt-6 max-w-md text-sm leading-8 text-clay-soft">
                מעלים תמונה של הילד או הילדה, בוחרים חליפה וגלימה — ורואים על המסך הדמיה של הבובה האישית. זו כרגע חוויית הדגמה, ולא שירות ייצור פעיל.
              </p>
              <ul className="mt-8 space-y-3 text-sm">
                {["מעלים 1–4 תמונות פנים", "בוחרים צבע גלימה ותנוחה", "רואים הדמיה על המסך", "מדמיינים בובה אחת ויחידה"].map((step, i) => (
                  <li key={step} className="flex items-center gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sage/15 font-heading text-xs font-black text-sage">{i + 1}</span>
                    {step}
                  </li>
                ))}
              </ul>
              <Link to="/superhero" data-testid="superhero-band-cta" className="mt-10 inline-flex items-center gap-2 rounded-full bg-terra px-8 py-4 text-sm font-bold text-white transition-all hover:bg-terra-dark active:scale-95">
                למעבדת הגיבורים <ArrowLeft className="h-4 w-4" />
              </Link>
            </div>
            <TiltCard className="group" max={7}>
              <img src={SUPERHERO_SAMPLE} alt="דוגמה להמחשה: בובת גיבור־על אישית" loading="lazy" className="animate-float relative mx-auto aspect-[4/5] w-full max-w-sm object-cover [mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_76%)]" style={{ transform: "translateZ(40px)" }} />
              <span className="absolute bottom-5 right-5 rounded-full border border-white/15 px-4 py-2 text-xs font-bold text-clay" data-testid="home-superhero-demo-notice">הדמיה להמחשה בלבד</span>
            </TiltCard>
          </div>
        </Reveal>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8 lg:pb-32" aria-labelledby="testimonials-title">
        <SectionTitle center title={<span id="testimonials-title">משפחות שכבר צבעו</span>} />
        <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.12}>
              <TiltCard className="group h-full" max={6}>
                <figure className="relative flex h-full flex-col p-6 [transform-style:preserve-3d]">
                  <span aria-hidden="true" className="pointer-events-none absolute -top-6 right-2 font-heading text-8xl font-black text-terra/30" style={{ transform: "translateZ(50px)" }}>”</span>
                  <div className="relative flex gap-1 text-mustard" aria-hidden="true">
                    {Array.from({ length: 5 }).map((_, s) => <Star key={s} className="h-4 w-4 fill-current" />)}
                  </div>
                  <blockquote className="relative mt-5 flex-1 text-base leading-8 text-clay" style={{ transform: "translateZ(24px)" }}>{t.quote}</blockquote>
                  <figcaption className="mt-6 text-xs font-bold text-clay-soft">{t.name}</figcaption>
                </figure>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden">
        <div className="relative mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <Reveal>
            <h2 className="font-heading text-3xl font-black sm:text-4xl">מוכנים להוריד פקק?</h2>
            <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-clay-soft">בובה אחת, ערכת טושים אחת, ושעה של שקט יצירתי לכל המשפחה.</p>
            <Link to="/shop" data-testid="bottom-cta-shop" className="mt-9 inline-flex items-center gap-2 rounded-full bg-clay px-10 py-4 text-sm font-bold text-cream transition-all hover:bg-terra hover:text-white active:scale-95">
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
      if (trackRef.current) setDistance(Math.max(0, trackRef.current.scrollWidth - window.innerWidth + 96));
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
      <Link to="/shop" data-testid="shelf-all-products-link" className="hidden shrink-0 items-center gap-2 pb-2 text-sm font-bold text-terra transition-colors hover:text-terra-deep sm:inline-flex">
        לכל הבובות <ArrowLeft className="h-4 w-4" />
      </Link>
    </div>
  );

  const row = (
    <motion.div ref={trackRef} style={isDesktop ? { x } : undefined} className="mt-12 flex w-full snap-x gap-6 overflow-x-auto px-4 pb-6 sm:px-6 lg:w-max lg:gap-8 lg:overflow-visible lg:px-8">
      {products.map((product, i) => (
        <div key={product.id} className="w-72 shrink-0 snap-start sm:w-80">
          <ProductCard product={product} index={i} />
        </div>
      ))}
      <Link to="/shop" className="flex w-56 shrink-0 snap-start flex-col items-center justify-center gap-4 text-center transition-all hover:-translate-y-2">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-terra text-white"><ArrowLeft className="h-6 w-6" /></span>
        <span className="font-heading text-xl font-bold text-terra-deep">לכל הבובות</span>
      </Link>
    </motion.div>
  );

  if (!isDesktop) {
    return (
      <section ref={targetRef} className="mx-auto max-w-7xl py-16" aria-label="מדף הבובות">
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
