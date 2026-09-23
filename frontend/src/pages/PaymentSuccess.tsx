import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { apiGet } from "@/lib/api";
import { useCart } from "@/lib/cart";
import type { PaymentStatus } from "@/lib/types";

type State = "loading" | "paid" | "failed";

export default function PaymentSuccess() {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id") ?? "";
  const [state, setState] = useState<State>("loading");
  const [orderNumber, setOrderNumber] = useState("");
  const { clear } = useCart();
  const cleared = useRef(false);

  useEffect(() => {
    if (!sessionId) {
      setState("failed");
      return;
    }
    let tries = 0;
    const timer = setInterval(async () => {
      tries += 1;
      try {
        const status = await apiGet<PaymentStatus>(`/payments/status/${sessionId}`);
        if (status.payment_status === "paid") {
          if (!cleared.current) {
            cleared.current = true;
            clear();
          }
          setOrderNumber(status.order_number ?? "");
          setState("paid");
          clearInterval(timer);
        }
      } catch {
        // keep polling — webhook may be a moment behind
      }
      if (tries > 20) {
        setState("failed");
        clearInterval(timer);
      }
    }, 2000);
    return () => clearInterval(timer);
  }, [sessionId, clear]);

  return (
    <div data-testid="payment-success-page" className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
      {state === "loading" && (
        <div>
          <Loader2 className="mx-auto h-14 w-14 animate-spin text-terra" />
          <h1 className="mt-6 font-heading text-3xl font-black">מאמתים את התשלום…</h1>
          <p className="mt-3 text-sm text-clay-soft">עוד רגע מסיימים — לא לסגור את הדף.</p>
        </div>
      )}

      {state === "paid" && (
        <div>
          <CheckCircle2 className="mx-auto h-16 w-16 text-sage" />
          <h1 className="mt-6 font-heading text-4xl font-black">התשלום בוצע — ההזמנה בדרך!</h1>
          <p className="mt-4 text-sm leading-7 text-clay-soft">
            תודה! הבובות יצאו להדפסה, יארזו עם הצבעים, ויגיעו תוך 3–5 ימי עסקים.
          </p>
          <div className="mt-8 rounded-3xl border border-clay/10 bg-white p-8">
            <p className="text-xs text-clay-soft">מספר הזמנה</p>
            <p data-testid="payment-order-number" className="mt-1 font-heading text-3xl font-black text-terra">
              {orderNumber}
            </p>
          </div>
          <Link
            to="/shop"
            data-testid="payment-success-continue-link"
            className="mt-10 inline-flex items-center gap-2 rounded-full bg-clay px-8 py-3.5 text-sm font-bold text-cream transition-all hover:bg-terra active:scale-95"
          >
            ממשיכים לצבוע
          </Link>
        </div>
      )}

      {state === "failed" && (
        <div>
          <XCircle className="mx-auto h-16 w-16 text-terra" />
          <h1 className="mt-6 font-heading text-3xl font-black">לא הצלחנו לאמת את התשלום</h1>
          <p className="mt-3 text-sm text-clay-soft">
            אם הכסף ירד — ההזמנה תעובד אוטומטית. אפשר גם לנסות שוב מהקופה.
          </p>
          <Link
            to="/checkout"
            data-testid="payment-failed-retry-link"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-terra px-8 py-3.5 text-sm font-bold text-white transition-all hover:bg-terra-dark active:scale-95"
          >
            חזרה לקופה
          </Link>
        </div>
      )}
    </div>
  );
}
