import { useState } from "react";
import { Clock, Mail, MapPin, MessageCircle, Send } from "lucide-react";
import { toast } from "sonner";
import { apiPost } from "@/lib/api";
import { Reveal } from "@/components/Reveal";

const INPUT =
  "w-full rounded-2xl border border-clay/15 bg-white px-4 py-3 text-sm outline-none transition-all placeholder:text-clay/35 focus:border-terra focus:ring-2 focus:ring-terra/20";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [sending, setSending] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      await apiPost("/contact", { ...form, phone: form.phone || undefined });
      toast.success("ההודעה נשלחה — נחזור אליכם תוך יום עסקים");
      setForm({ name: "", email: "", phone: "", message: "" });
    } catch {
      toast.error("השליחה נכשלה — נסו שוב או כתבו לנו במייל");
    } finally {
      setSending(false);
    }
  };

  return (
    <div data-testid="contact-page" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
      <Reveal className="max-w-xl">
        <p className="text-xs font-bold tracking-[0.2em] text-terra">צור קשר</p>
        <h1 className="mt-3 font-heading text-4xl font-black sm:text-5xl">נדבר?</h1>
        <p className="mt-4 text-sm leading-7 text-clay-soft">
          שאלה על הזמנה, רעיון לבובה חדשה או אירוע קבוצתי — אנחנו כאן.
        </p>
      </Reveal>

      <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-12">
        <form onSubmit={submit} className="rounded-3xl border border-clay/10 bg-sand/60 p-7 lg:col-span-7">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-xs font-semibold">שם מלא <span className="text-terra">*</span></span>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} data-testid="contact-name-input" className={INPUT} placeholder="ישראלה ישראלי" />
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-semibold">אימייל <span className="text-terra">*</span></span>
              <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} data-testid="contact-email-input" className={INPUT} placeholder="you@example.com" dir="ltr" />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-2 block text-xs font-semibold">טלפון (לא חובה)</span>
              <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} data-testid="contact-phone-input" className={INPUT} placeholder="050-1234567" />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-2 block text-xs font-semibold">ההודעה <span className="text-terra">*</span></span>
              <textarea required rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} data-testid="contact-message-input" className={`${INPUT} resize-none`} placeholder="ספרו לנו במה נוכל לעזור…" />
            </label>
          </div>
          <button
            type="submit"
            disabled={sending}
            data-testid="contact-submit-button"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-terra px-8 py-3.5 text-sm font-bold text-white transition-all hover:bg-terra-dark active:scale-95 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            {sending ? "שולחים…" : "שליחת הודעה"}
          </button>
        </form>

        <div className="space-y-4 lg:col-span-5">
          <InfoCard icon={<MapPin className="h-5 w-5" />} title="הסטודיו שלנו" lines={["רח׳ האומנים 12, תל־אביב", "איסוף עצמי בתיאום מראש"]} />
          <InfoCard icon={<Clock className="h-5 w-5" />} title="שעות מענה" lines={["א׳–ה׳ 09:00–18:00", "ו׳ 09:00–13:00"]} />
          <InfoCard icon={<Mail className="h-5 w-5" />} title="מייל וטלפון" lines={["shalom@buba3d.co.il", "03-555-0134"]} />
          <a
            href="https://wa.me/97235550134"
            target="_blank"
            rel="noreferrer"
            data-testid="contact-whatsapp-button"
            className="flex items-center gap-4 rounded-3xl border border-sage/30 bg-sage-soft p-6 transition-all hover:-translate-y-0.5 hover:shadow-lg"
          >
            <MessageCircle className="h-6 w-6 text-sage-deep" />
            <span>
              <span className="block text-sm font-bold text-sage-deep">וואטסאפ ישיר</span>
              <span className="block text-xs text-sage-deep/80">מענה מהיר בשעות הפעילות</span>
            </span>
          </a>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ icon, title, lines }: { icon: React.ReactNode; title: string; lines: string[] }) {
  return (
    <div className="flex items-start gap-4 rounded-3xl border border-clay/10 bg-white p-6">
      <span className="mt-0.5 text-terra">{icon}</span>
      <div>
        <p className="text-sm font-bold">{title}</p>
        {lines.map((line) => (
          <p key={line} className="mt-1 text-xs leading-6 text-clay-soft">{line}</p>
        ))}
      </div>
    </div>
  );
}
