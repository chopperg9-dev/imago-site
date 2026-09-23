import { Link } from "react-router-dom";
import { ArrowLeft, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_COST, useCart } from "@/lib/cart";
import { Reveal } from "@/components/Reveal";

export default function CartPage() {
  const { items, setQty, remove, subtotal } = useCart();
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : SHIPPING_COST;
  const remaining = FREE_SHIPPING_THRESHOLD - subtotal;

  return (
    <div data-testid="cart-page" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
      <Reveal>
        <h1 className="font-heading text-4xl font-black sm:text-5xl">סל הקניות</h1>
      </Reveal>

      {items.length === 0 ? (
        <Reveal delay={0.1}>
          <div className="mt-14 flex flex-col items-center rounded-3xl border border-dashed border-clay/20 bg-white/60 px-6 py-20 text-center">
            <ShoppingBag className="h-10 w-10 text-clay/30" />
            <p className="mt-5 font-heading text-2xl font-bold">הסל עדיין לבן — בדיוק כמו הבובות שלנו</p>
            <p className="mt-2 text-sm text-clay-soft">זמן מושלם לבחור בובה ראשונה לצביעה.</p>
            <Link
              to="/shop"
              data-testid="cart-empty-shop-link"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-terra px-8 py-3.5 text-sm font-bold text-white transition-all hover:bg-terra-dark active:scale-95"
            >
              לחנות הבובות <ArrowLeft className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>
      ) : (
        <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-12">
          <ul className="space-y-5 lg:col-span-8" data-testid="cart-items-list">
            {items.map((item) => (
              <li
                key={item.key}
                data-testid={`cart-item-${item.key}`}
                className="flex items-center gap-5 rounded-3xl border border-clay/10 bg-white p-4 sm:p-5"
              >
                <img src={item.image} alt={item.name} className="h-20 w-20 shrink-0 rounded-2xl bg-sand object-cover sm:h-24 sm:w-24" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-heading text-base font-bold sm:text-lg">{item.name}</p>
                  {item.meta && <p className="mt-0.5 text-xs text-clay-soft">{item.meta}</p>}
                  <p className="mt-1 text-sm font-bold text-terra">₪{item.price}</p>
                </div>
                <div className="flex items-center rounded-full border border-clay/15">
                  <button
                    type="button"
                    onClick={() => setQty(item.key, item.qty + 1)}
                    data-testid={`cart-qty-plus-${item.key}`}
                    aria-label="הגדלת כמות"
                    className="flex h-9 w-9 items-center justify-center hover:text-terra"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-7 text-center text-sm font-bold">{item.qty}</span>
                  <button
                    type="button"
                    onClick={() => setQty(item.key, item.qty - 1)}
                    data-testid={`cart-qty-minus-${item.key}`}
                    aria-label="הקטנת כמות"
                    className="flex h-9 w-9 items-center justify-center hover:text-terra"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => remove(item.key)}
                  data-testid={`cart-remove-${item.key}`}
                  aria-label={`הסרת ${item.name}`}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-clay-soft transition-colors hover:bg-terra-soft hover:text-terra"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>

          <aside className="lg:col-span-4">
            <div className="sticky top-24 rounded-3xl border border-clay/10 bg-white p-7" data-testid="cart-summary">
              <h2 className="font-heading text-xl font-black">סיכום הזמנה</h2>
              {remaining > 0 ? (
                <p className="mt-4 rounded-2xl bg-terra-soft px-4 py-3 text-xs font-medium leading-5 text-terra-deep">
                  עוד ₪{remaining} ומשלוח עלינו
                </p>
              ) : (
                <p className="mt-4 rounded-2xl bg-sage-soft px-4 py-3 text-xs font-medium text-sage-deep">
                  מעולה! זכיתם במשלוח חינם
                </p>
              )}
              <dl className="mt-6 space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-clay-soft">סכום ביניים</dt>
                  <dd className="font-bold" data-testid="cart-subtotal">₪{subtotal}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-clay-soft">משלוח</dt>
                  <dd className="font-bold">{shipping === 0 ? "חינם" : `₪${shipping}`}</dd>
                </div>
                <div className="flex justify-between border-t border-clay/10 pt-3 font-heading text-lg font-black">
                  <dt>סה״כ</dt>
                  <dd data-testid="cart-total">₪{subtotal + shipping}</dd>
                </div>
              </dl>
              <Link
                to="/checkout"
                data-testid="proceed-to-checkout-button"
                className="mt-7 flex items-center justify-center gap-2 rounded-full bg-terra px-8 py-4 text-sm font-bold text-white transition-all hover:bg-terra-dark active:scale-95"
              >
                ממשיכים לתשלום <ArrowLeft className="h-4 w-4" />
              </Link>
              <p className="mt-4 text-center text-[11px] leading-5 text-clay-soft">
                תשלום בביט — פרטי התשלום יוצגו בסיום ההזמנה
              </p>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
