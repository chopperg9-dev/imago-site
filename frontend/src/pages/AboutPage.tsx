import { Heart, Leaf, Printer, ShieldCheck } from "lucide-react";
import { Reveal } from "@/components/Reveal";

const WORKSHOP =
  "https://static.prod-images.emergentagent.com/jobs/4ce74442-beb6-4a2a-a71b-521399fd659c/images/134cee2121d327364ebef1db2ff1f5bfea807012f4bf6b20a87da8fdf2066183.jpeg";

const VALUES = [
  { icon: Leaf, title: "חומרים אקולוגיים", text: "אנחנו מדפיסים מ־PLA — פלסטיק צמחי מתכלה, נטול רעלים, שמקורו בעמילן תירס." },
  { icon: ShieldCheck, title: "בטיחות מעל הכול", text: "הטושים בערכות הם אקריליים על בסיס מים, בעלי תקן בטיחות לילדים. מתאים מגיל 5 בפיקוח." },
  { icon: Printer, title: "הדפסה מקומית", text: "כל בובה מודפסת ונבדקת אצלנו בסטודיו בתל־אביב — בלי שרשראות אספקה ובלי פשרות." },
  { icon: Heart, title: "יצירה משפחתית", text: "אנחנו מאמינים שהמסכים יכולים לחכות. שעה של צביעה משפחתית שווה אלף משחקים." },
];

export default function AboutPage() {
  return (
    <div data-testid="about-page" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
        <Reveal>
          <p className="text-xs font-bold tracking-[0.2em] text-terra-deep">הסיפור שלנו</p>
          <h1 className="mt-3 font-heading text-4xl font-black leading-tight sm:text-5xl">
            התחלנו מבובה לבנה אחת על שולחן המטבח
          </h1>
          <div className="mt-6 space-y-5 text-sm leading-8 text-clay-soft">
            <p>
              IMAGO נולדה בערב שבת אחד, כשהדפסנו בובה קטנה לבת שלנו ונתנו לה טושים אקריליים. שעתיים של שקט,
              ריכוז וגאווה אחת ענקית אחר כך — הבנו שיש פה משהו אמיתי: צעצוע שהילדים לא רק מקבלים,
              אלא יוצרים.
            </p>
            <p>
              היום אנחנו סטודיו קטן בתל־אביב שמדפיס בובות מעוצבות מ־PLA אקולוגי, ושולח אותן לבנות
              עם ערכת טושים אקריליים מלאה. כל בובה שיוצאת מאיתנו היא הזמנה — להוריד את הילדים מהמסך ולתת להם
              להיות אומנים.
            </p>
            <p>
              במעבדת הדמיון שלנו אנחנו בוחנים גם רעיון לגיבור־על אישי בהשראת תמונה. כרגע זו חוויית הדגמה, ולא שירות פעיל ליצירת מודלים להדפסה.
            </p>
          </div>
        </Reveal>
        <Reveal delay={0.15}>
          <div className="overflow-hidden rounded-[2rem] border border-clay/10 shadow-xl">
            <img src={WORKSHOP} alt="ילד צובע את מלאני בטוש אקרילי כתום" className="aspect-[4/5] max-h-[560px] w-full object-cover" />
          </div>
        </Reveal>
      </div>

      <div className="mt-24 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {VALUES.map((v, i) => (
          <Reveal key={v.title} delay={i * 0.1}>
            <div className="h-full rounded-3xl border border-clay/10 bg-sand p-7">
              <v.icon className="h-7 w-7 text-terra" />
              <h3 className="mt-4 font-heading text-lg font-bold">{v.title}</h3>
              <p className="mt-2 text-xs leading-6 text-clay-soft">{v.text}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
