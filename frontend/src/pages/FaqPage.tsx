import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Reveal } from "@/components/Reveal";

const FAQS = [
  {
    q: "האם הצבעים בטוחים לילדים?",
    a: "כן. כל הצבעים בערכות הם אקריליק על בסיס מים, נטולי רעלים ובעלי תקן בטיחות אירופאי וישראלי לצעצועים. מתאים מגיל 3 ומעלה בפיקוח מבוגר.",
  },
  {
    q: "ממה עשויות הבובות?",
    a: "הבובות מודפסות מ־PLA — חומר פלסטי צמחי מתכלה המיוצר מעמילן תירס. הוא קשיח, בטוח למגע ונטול BPA.",
  },
  {
    q: "כמה זמן לוקח לצבע להתייבש?",
    a: "צבע אקריליק מתייבש למגע תוך 20–30 דקות, ומתייבש לגמרי תוך כשעה. מומלץ לחכות יום לפני משחק אינטנסיבי בבובה.",
  },
  {
    q: "אפשר לשטוף את הבובה אחרי הצביעה?",
    a: "אפשר לנגב במטלית לחה. לא מומלץ לשטוף במים זורמים או במדיח — הצבע עלול לדהות.",
  },
  {
    q: "איך עובד גיבור־העל האישי?",
    a: "מעלים 1–4 תמונות של הילד או הילדה, בוחרים צבע גלימה ותנוחה, ותוך דקות מקבלים תצוגה מקדימה. רק אחרי שאישרתם אותה, אנחנו מדפיסים את הבובה ושולחים אליכם. ייצור הבובה האישית לוקח 7–10 ימי עסקים.",
  },
  {
    q: "מה קורה לתמונות שהעלינו?",
    a: "התמונות משמשות אך ורק ליצירת הדמות, מאוחסנות בצורה מאובטחת, ונמחקות אוטומטית עד 14 יום לאחר יצירת התצוגה. פרטים מלאים במדיניות הפרטיות.",
  },
  {
    q: "נגמר לנו צבע מסוים — מה עושים?",
    a: "קורה לכולם! אפשר להזמין באתר ערכת צביעה פרימיום עם 12 צבעים, או לכתוב לנו ונשלח מילוי חוזר של הצבע החסר.",
  },
  {
    q: "הבובה הגיעה שבורה — מה עושים?",
    a: "מצטערים מאוד! שלחו לנו תמונה של הנזק תוך 7 ימים מקבלת המשלוח, ונשלח בובה חלופית על חשבוננו — בלי שאלות.",
  },
];

export default function FaqPage() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div data-testid="faq-page" className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
      <Reveal className="text-center">
        <p className="text-xs font-bold tracking-[0.2em] text-terra-deep">שאלות ותשובות</p>
        <h1 className="mt-3 font-heading text-4xl font-black sm:text-5xl">שואלים, אנחנו עונים</h1>
      </Reveal>

      <div className="mt-12 space-y-4">
        {FAQS.map((faq, i) => {
          const isOpen = open === i;
          return (
            <Reveal key={faq.q} delay={Math.min(i, 4) * 0.06}>
              <div className={`rounded-3xl border transition-colors ${isOpen ? "border-terra/40 bg-sand" : "border-clay/10 bg-sand"}`}>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  data-testid={`faq-question-${i}`}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-right"
                >
                  <span className="font-heading text-base font-bold sm:text-lg">{faq.q}</span>
                  <ChevronDown className={`h-5 w-5 shrink-0 text-terra transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <p className="px-6 pb-6 text-sm leading-8 text-clay-soft" data-testid={`faq-answer-${i}`}>{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}
