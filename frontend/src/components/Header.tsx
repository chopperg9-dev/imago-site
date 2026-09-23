import { Link, NavLink } from "react-router-dom";
import { Menu, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const LINKS = [
  { to: "/shop", label: "החנות" },
  { to: "/superhero", label: "גיבור־העל שלי" },
  { to: "/about", label: "אודות" },
  { to: "/faq", label: "שאלות" },
  { to: "/contact", label: "צור קשר" },
];

export default function Header() {
  const { count } = useCart();
  return (
    <header className="sticky top-0 z-50 border-b border-clay/10 bg-cream/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5" data-testid="header-logo-link">
          <img
            src="/logo-character.png"
            alt="IMAGO — Color Your Character"
            className="h-11 w-11 object-contain"
          />
          <span className="leading-none">
            <span className="block text-xl font-black tracking-[0.2em]" style={{ fontFamily: "'Frank Ruhl Libre', serif" }}>IMAGO</span>
            <span className="mt-0.5 block text-[8px] font-semibold tracking-[0.32em] text-clay-soft">
              COLOR YOUR CHARACTER
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="ניווט ראשי">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              data-testid={`nav-${link.to.slice(1)}-link`}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors hover:text-terra ${
                  isActive ? "text-terra" : "text-clay/80"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/cart"
            data-testid="header-cart-button"
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-clay/15 bg-white transition-all hover:border-terra hover:text-terra"
            aria-label="סל קניות"
          >
            <ShoppingBag className="h-4.5 w-4.5" />
            {count > 0 && (
              <span
                data-testid="header-cart-count"
                className="absolute -top-1 -left-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-terra px-1 text-[11px] font-bold text-white"
              >
                {count}
              </span>
            )}
          </Link>

          <Sheet>
            <SheetTrigger
              data-testid="mobile-menu-button"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-clay/15 bg-white lg:hidden"
              aria-label="תפריט"
            >
              <Menu className="h-4.5 w-4.5" />
            </SheetTrigger>
            <SheetContent side="left" className="bg-cream">
              <SheetTitle className="font-heading text-xl font-black tracking-[0.25em]">IMAGO</SheetTitle>
              <nav className="mt-8 flex flex-col gap-5" aria-label="תפריט נייד">
                {LINKS.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    data-testid={`mobile-nav-${link.to.slice(1)}-link`}
                    className={({ isActive }) =>
                      `font-heading text-2xl font-bold ${isActive ? "text-terra" : "text-clay"}`
                    }
                  >
                    {link.label}
                  </NavLink>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
