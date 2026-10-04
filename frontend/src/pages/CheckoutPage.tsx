import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Check, CheckCircle2, Copy, MapPin, Smartphone, Truck } from "lucide-react";
import { toast } from "sonner";
import { apiPost } from "@/lib/api";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_COST, useCart } from "@/lib/cart";
import type { OrderResult } from "@/lib/types";
import { Reveal } from "@/components/Reveal";

export default function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const navigate = useNavigate();
  const [method, setMethod] = useState<"courier" | "pickup">("courier");
  const [form, setForm] = useState({ name: "", email: "", phone: "", city: "", address: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);
  const [order, setOrder] = useState<OrderResult | null>(null);
  const [copied, setCopied] = useState(false);

  const shipping = method === "pickup" || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const copyPhone = async () => {
    try {
      await navigator.clipboard.writeText("0503331809");
      setCopied(true);
      toast.success("המספר הועתק");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("ההעתקה נכשלה — רשמו: 050-333-1809");
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error("הסל ריק — קודם בוחרים בובה");
      navigate("/shop");
      return;
    }
    setSubmitting(true);
    try {
      const result = await apiPost<OrderResult>("/orders", {
        customer: { name: form.name, email: form.email, phone: form.phone },
        shipping: { address: form.address, city: form.city, method, notes: form.notes || undefined },
        items,
      });
      setOrder(result);
      clear();
      window.scrollTo(0, 0);
    } catch {
      toast.error("שמירת ההזמנה נכשלה — נסו שוב");
    } finally {
      setSubmitting(false);
    }
  };

  if (order) {
    return (
      <div data-testid="order-success-page" className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
        <Reveal>
          <CheckCircle2 className="mx-auto h-16 w-16 text-sage" />
          <h1 className="mt-6 font-heading text-4xl font-black">ההזמנה התקבלה!</h1>
          <p className="mt-3 text-sm leading-7 text-clay-soft">נשאר רק לשלם בביט — והבובות יוצאות להדפסה.</p>

          <div className="mt-8 rounded-3xl border border-clay/10 bg-sand p-8 text-right">
            <div className="flex items-center justify-between">
              <span className="text-xs text-clay-soft">מספר הזמנה</span>
              <span data-testid="order-number" className="font-heading text-2xl font-black text-terra">{order.order_number}</span>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-clay/10 pt-3">
              <span className="text-xs text-clay-soft">סכום לתשלום</span>
              <span data-testid="order-total" className="font-heading text-2xl font-black">₪{order.total}</span>
            </div>
          </div>

          <div className="mt-6 rounded-3xl border-2 border-terra/30 bg-terra-soft p-8 text-right">
            <p className="flex items-center gap-2 font-heading text-lg font-black text-terra-deep">
              <Smartphone className="h-5 w-5" /> משלמים בביט — שלושה צעדים
            </p>
            <ol className="mt-5 space-y-4 text-sm leading-8 text-clay">
              <li>1 · פתחו את אפליקציית ביט בנייד</li>
              <li>
                2 · שלחו <b>₪{order.total}</b> למספר העסקי
                <button
                  type="button"
                  onClick={copyPhone}
                  data-testid="bit-copy-phone-button"
                  className="mx-2 inline-flex items-center gap-2 rounded-full bg-clay px-4 py-1.5 font-heading text-base font-black text-cream transition-all hover:bg-terra active:scale-95"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  <span dir="ltr">050-333-1809</span>
                </button>
              </li>
              <li>
                3 · בהערת התשלום ציינו את מספר ההזמנה <b dir="ltr">{order.order_number}</b>
              </li>
            </ol>
            <p className="mt-5 text-[11px] leading-5 text-terra-deep/80">
              ההזמנה תאושר ותצא להדפסה מיד עם קבלת התשלום.
            </p>
          </div>

          <Link
            to="/shop"
            data-testid="order-success-continue-link"
            className="mt-10 inline-flex items-center gap-2 rounded-full bg-clay px-8 py-3.5 text-sm font-bold text-cream transition-all hover:bg-terra active:scale-95"
          >
            ממשיכים לצבוע <ArrowLeft className="h-4 w-4" />
          </Link>
        </Reveal>
      </div>
    );
  }

  return (
    <div data-testid="checkout-page" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
      <Reveal>
        <h1 className="font-heading text-4xl font-black sm:text-5xl">קופה</h1>
        <p className="mt-3 text-sm text-clay-soft">עוד רגע מסיימים — והבובות יוצאות להדפסה.</p>
      </Reveal>

      <form onSubmit={submit} className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-12">
        <div className="space-y-8 lg:col-span-7">
          <section className="rounded-3xl border border-clay/10 bg-sand p-7">
            <h2 className="font-heading text-xl font-black">פרטי קשר</h2>
            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="שם מלא" required>
                <input data-testid="checkout-name-input" required value={form.name} onChange={set("name")} className={INPUT} placeholder="ישראלה ישראלי" />
              </Field>
              <Field label="טלפון" required>
                <input data-testid="checkout-phone-input" required type="tel" value={form.phone} onChange={set("phone")} className={INPUT} placeholder="050-1234567" />
              </Field>
              <Field label="אימייל" required>
                <input data-testid="checkout-email-input" required type="email" value={form.email} onChange={set("email")} className={INPUT} placeholder="you@example.com" dir="ltr" />
              </Field>
            </div>
          </section>

          <section className="rounded-3xl border border-clay/10 bg-sand p-7">
            <h2 className="font-heading text-xl font-black">אופן קבלה</h2>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <MethodCard
                active={method === "courier"}
                onClick={() => setMethod("courier")}
                icon={<Truck className="h-5 w-5" />}
                title="שליח עד הבית"
                desc={`3–5 ימי עסקים · ${subtotal >= FREE_SHIPPING_THRESHOLD ? "חינם" : `₪${SHIPPING_COST}`}`}
                testid="delivery-method-courier"
              />
              <MethodCard
                active={method === "pickup"}
                onClick={() => setMethod("pickup")}
                icon={<MapPin className="h-5 w-5" />}
                title="איסוף מהסטודיו"
                desc="רח׳ האומנים 12, תל־אביב · חינם"
                testid="delivery-method-pickup"
              />
            </div>
            {method === "courier" && (
              <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Field label="עיר" required>
                  <input data-testid="checkout-city-input" required={method === "courier"} value={form.city} onChange={set("city")} className={INPUT} placeholder="תל־אביב" />
                </Field>
                <Field label="רחוב ומספר" required>
                  <input data-testid="checkout-address-input" required={method === "courier"} value={form.address} onChange={set("address")} className={INPUT} placeholder="הדקל 8, דירה 3" />
                </Field>
              </div>
            )}
            <Field label="הערות לשליח (לא חובה)">
              <textarea data-testid="checkout-notes-input" value={form.notes} onChange={set("notes")} rows={3} className={`${INPUT} resize-none`} placeholder="קוד לבניין, קומה, בקשות מיוחדות…" />
            </Field>
          </section>

          <section className="rounded-3xl border border-clay/10 bg-sand p-7">
            <h2 className="font-heading text-xl font-black">אמצעי תשלום</h2>
            <div
              className="mt-6 flex items-start gap-4 rounded-2xl border-2 border-terra bg-terra-soft p-5"
              data-testid="payment-method-bit"
            >
              <span className="mt-0.5 text-terra"><Smartphone className="h-5 w-5" /></span>
              <span>
                <span className="block text-sm font-bold text-terra-deep">ביט</span>
                <span className="mt-1 block text-xs leading-5 text-clay-soft">
                  תשלום מיידי מהנייד, בלי כרטיס אשראי — פרטי התשלום יוצגו מיד אחרי אישור ההזמנה
                </span>
              </span>
            </div>
          </section>
        </div>

        <aside className="lg:col-span-5">
          <div className="sticky top-24 rounded-3xl border border-clay/10 bg-sand p-7">
            <h2 className="font-heading text-xl font-black">ההזמנה שלכם</h2>
            <ul className="mt-5 space-y-4" data-testid="checkout-items-list">
              {items.map((item) => (
                <li key={item.key} className="flex items-center gap-4">
                  <img src={item.image} alt={item.name} className="h-14 w-14 rounded-xl bg-sand object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{item.name}</p>
                    <p className="text-xs text-clay-soft">כמות: {item.qty}</p>
                  </div>
                  <p className="text-sm font-bold">₪{item.price * item.qty}</p>
                </li>
              ))}
            </ul>
            <dl className="mt-6 space-y-3 border-t border-clay/10 pt-5 text-sm">
              <div className="flex justify-between">
                <dt className="text-clay-soft">סכום ביניים</dt>
                <dd className="font-bold">₪{subtotal}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-clay-soft">משלוח</dt>
                <dd className="font-bold">{shipping === 0 ? "חינם" : `₪${shipping}`}</dd>
              </div>
              <div className="flex justify-between font-heading text-lg font-black">
                <dt>סה״כ</dt>
                <dd data-testid="checkout-total">₪{subtotal + shipping}</dd>
              </div>
            </dl>
            <button
              type="submit"
              disabled={submitting || items.length === 0}
              data-testid="checkout-submit-button"
              className="mt-7 w-full rounded-full bg-terra py-4 text-sm font-bold text-white transition-all hover:bg-terra-dark active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "רושמים את ההזמנה…" : "מסיימים ומקבלים פרטי תשלום"}
            </button>
            <p className="mt-4 text-center text-[11px] leading-5 text-clay-soft">
              התשלום מתבצע בביט — פרטי התשלום יוצגו מיד אחרי אישור ההזמנה
            </p>
          </div>
        </aside>
      </form>
    </div>
  );
}

const INPUT =
  "w-full rounded-2xl border border-clay/15 bg-cream px-4 py-3 text-sm outline-none transition-all placeholder:text-clay/35 focus:border-terra focus:ring-2 focus:ring-terra/20";

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold text-clay">
        {label} {required && <span className="text-terra">*</span>}
      </span>
      {children}
    </label>
  );
}

function MethodCard({
  active,
  onClick,
  icon,
  title,
  desc,
  testid,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  desc: string;
  testid: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid={testid}
      aria-pressed={active}
      className={`flex items-start gap-4 rounded-2xl border-2 p-5 text-right transition-all active:scale-[0.98] ${
        active ? "border-terra bg-terra-soft" : "border-clay/10 bg-cream hover:border-terra/40"
      }`}
    >
      <span className={`mt-0.5 ${active ? "text-terra" : "text-clay-soft"}`}>{icon}</span>
      <span>
        <span className="block text-sm font-bold">{title}</span>
        <span className="mt-1 block text-xs text-clay-soft">{desc}</span>
      </span>
    </button>
  );
}
