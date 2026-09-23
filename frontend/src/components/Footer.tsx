import { Link } from "react-router-dom";
import { Instagram, Mail, MapPin, Phone } from "lucide-react";

const SHOP_LINKS = [
  { to: "/shop", label: "כל הבובות" },
  { to: "/superhero", label: "גיבור־על אישי" },
  { to: "/cart", label: "סל הקניות" },
  { to: "/faq", label: "שאלות נפוצות" },
];

const INFO_LINKS = [
  { to: "/about", label: "אודות" },
  { to: "/shipping", label: "משלוחים" },
  { to: "/returns", label: "החזרות" },
  { to: "/contact", label: "צור קשר" },
];

const LEGAL_LINKS = [
  { to: "/privacy", label: "מדיניות פרטיות" },
  { to: "/terms", label: "תנאי שימוש" },
];

export default function Footer() {
  return (
    <footer className="bg-ink text-[#F7F3EE]">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-5">
          <div className="col-span-2">
            <div className="flex items-center gap-3">
              <img src="/logo-character.png" alt="IMAGO" className="h-16 w-16 object-contain drop-shadow-lg" />
              <div>
                <p className="font-heading text-2xl font-black tracking-[0.25em]">IMAGO</p>
                <p className="mt-0.5 text-[10px] tracking-[0.3em] text-[#B5A79E]">COLOR YOUR CHARACTER</p>
              </div>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-7 text-[#B5A79E]">
              בובות הדפסה תלת־ממדית מ־PLA אקולוגי, מגיעות לבנות עם ערכת צבעים — כדי שהילדים יהפכו אותן ליצירת אמנות משלהן.
            </p>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              data-testid="footer-instagram-link"
              className="mt-6 inline-flex items-center gap-2 text-sm text-[#E48766] transition-colors hover:text-white"
            >
              <Instagram className="h-4 w-4" /> עקבו אחרינו
            </a>
          </div>

          <FooterCol title="קניות" links={SHOP_LINKS} />
          <FooterCol title="מידע" links={INFO_LINKS} />
          <FooterCol title="משפטי" links={LEGAL_LINKS} />
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-8 text-xs text-[#B5A79E] sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 IMAGO · Color Your Character · כל הזכויות שמורות</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> רח׳ האומנים 12, תל־אביב</span>
            <span className="inline-flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> 03-555-0134</span>
            <span className="inline-flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> shalom@imago-dolls.co.il</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { to: string; label: string }[] }) {
  return (
    <div>
      <p className="text-sm font-semibold tracking-wide text-white/90">{title}</p>
      <ul className="mt-4 space-y-3">
        {links.map((link) => (
          <li key={link.to}>
            <Link
              to={link.to}
              data-testid={`footer-link-${link.to.slice(1)}`}
              className="text-sm text-[#B5A79E] transition-colors hover:text-[#E48766]"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
