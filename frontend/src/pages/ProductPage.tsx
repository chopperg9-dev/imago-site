import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Check, Minus, Plus, Ruler, ShoppingBag, Truck } from "lucide-react";
import { toast } from "sonner";
import { apiGet } from "@/lib/api";
import { useCart } from "@/lib/cart";
import type { Product } from "@/lib/types";
import ProductCard from "@/components/ProductCard";
import { Reveal } from "@/components/Reveal";
import TiltCard from "@/components/TiltCard";
import ModelViewer from "@/components/ModelViewer";

const DIFFICULTY_STYLE: Record<string, string> = {
  "קל": "bg-sage-soft text-sage-deep",
  "בינוני": "bg-terra-soft text-terra-deep",
  "מתקדם": "bg-clay text-cream",
};

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const [qty, setQty] = useState(1);
  const { add } = useCart();

  const { data: product } = useQuery({
    queryKey: ["product", id],
    queryFn: () => apiGet<Product>(`/products/${id}`),
    enabled: Boolean(id),
  });
  const { data: all } = useQuery({
    queryKey: ["products"],
    queryFn: () => apiGet<Product[]>("/products"),
  });

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          <div className="aspect-square animate-pulse rounded-3xl bg-sand" />
          <div className="space-y-4 pt-6">
            <div className="h-8 w-2/3 animate-pulse rounded bg-sand" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-sand" />
            <div className="h-24 w-full animate-pulse rounded bg-sand" />
          </div>
        </div>
      </div>
    );
  }

  const related = (all ?? []).filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);

  const addToCart = () => {
    add({ key: product.id, name: product.name, price: product.price, image: product.image }, qty);
    toast.success(`${product.name} נוספה לסל`, { description: `כמות: ${qty}` });
  };

  return (
    <div data-testid="product-page" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <nav className="text-xs text-clay-soft" aria-label="פירורי לחם">
        <Link to="/" className="hover:text-terra">בית</Link>
        <span className="mx-2">/</span>
        <Link to="/shop" className="hover:text-terra">החנות</Link>
        <span className="mx-2">/</span>
        <span className="text-clay">{product.name}</span>
      </nav>

      <div className="mt-8 grid grid-cols-1 gap-12 lg:grid-cols-2">
        <Reveal>
          <TiltCard className="group" max={6}>
            <div className="relative [transform-style:preserve-3d]">
              {product.model ? (
                <>
                  <ModelViewer url={product.model} interactive className="aspect-square w-full" testId="product-model-viewer" />
                  <p className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs text-clay-soft">גררו כדי לסובב את הבובה</p>
                </>
              ) : (
                <img src={product.image} alt={product.name} className="animate-float relative aspect-square w-full object-cover [mask-image:radial-gradient(ellipse_at_center,black_52%,transparent_76%)] transition-transform duration-700 group-hover:scale-105" style={{ transform: "translateZ(40px)" }} />
              )}
            </div>
          </TiltCard>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="flex h-full flex-col">
            <span className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${DIFFICULTY_STYLE[product.difficulty] ?? "bg-sand text-clay"}`}>
              רמת צביעה: {product.difficulty}
            </span>
            <h1 className="mt-4 font-heading text-4xl font-black sm:text-5xl">{product.name}</h1>
            <p className="mt-2 text-base text-clay-soft">{product.tagline}</p>
            <p className="mt-6 font-heading text-3xl font-black text-terra">₪{product.price}</p>

            <p className="mt-6 text-sm leading-8 text-clay">{product.description}</p>

            <ul className="mt-6 space-y-2.5">
              {product.includes.map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-sm text-clay">
                  <Check className="h-4 w-4 shrink-0 text-sage" />
                  {item}
                </li>
              ))}
            </ul>

            {product.height_cm > 0 && (
              <p className="mt-5 inline-flex items-center gap-2 text-xs text-clay-soft">
                <Ruler className="h-4 w-4" /> גובה הבובה: {product.height_cm} ס״מ
              </p>
            )}
            <p className="mt-2 inline-flex items-center gap-2 text-xs text-clay-soft">
              <Truck className="h-4 w-4" /> משלוח 3–5 ימי עסקים · חינם מעל ₪199
            </p>

            <div className="mt-8 flex items-center gap-4">
              <div className="flex items-center rounded-full border border-clay/15 bg-sand">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.min(9, q + 1))}
                  data-testid="qty-increase-button"
                  aria-label="הגדלת כמות"
                  className="flex h-11 w-11 items-center justify-center rounded-full transition-colors hover:text-terra"
                >
                  <Plus className="h-4 w-4" />
                </button>
                <span data-testid="qty-value" className="w-8 text-center font-heading text-lg font-bold">{qty}</span>
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  data-testid="qty-decrease-button"
                  aria-label="הקטנת כמות"
                  className="flex h-11 w-11 items-center justify-center rounded-full transition-colors hover:text-terra"
                >
                  <Minus className="h-4 w-4" />
                </button>
              </div>
              <button
                type="button"
                onClick={addToCart}
                data-testid="add-to-cart-button"
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-terra px-8 py-3.5 text-sm font-bold text-white transition-all hover:bg-terra-dark active:scale-95"
              >
                <ShoppingBag className="h-4 w-4" />
                הוספה לסל · ₪{product.price * qty}
              </button>
            </div>

            <Link
              to="/shop"
              data-testid="back-to-shop-link"
              className="mt-6 inline-flex w-fit items-center gap-2 text-sm font-medium text-clay-soft transition-colors hover:text-terra"
            >
              <ArrowLeft className="h-4 w-4 rotate-180" />
              חזרה לחנות
            </Link>
          </div>
        </Reveal>
      </div>

      {related.length > 0 && (
        <section className="mt-24" aria-labelledby="related-title">
          <Reveal>
            <h2 id="related-title" className="font-heading text-2xl font-black sm:text-3xl">עוד מאותה קטגוריה</h2>
          </Reveal>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
