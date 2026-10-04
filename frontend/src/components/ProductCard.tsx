import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/lib/cart";
import type { Product } from "@/lib/types";
import TiltCard from "@/components/TiltCard";

const DIFFICULTY_STYLE: Record<string, string> = {
  "קל": "bg-sage-soft text-sage-deep border-sage/30",
  "בינוני": "bg-terra-soft text-terra-deep border-terra/30",
  "מתקדם": "bg-clay text-cream border-clay",
};

export default function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();

  const quickAdd = () => {
    add({ key: product.id, name: product.name, price: product.price, image: product.image });
    toast.success(`${product.name} נוספה לסל`);
  };

  return (
    <TiltCard className="group h-full" max={8}>
      <article
        data-testid={`product-card-${product.id}`}
        className="depth-card relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 transition-[border-color,box-shadow] duration-300 group-hover:border-terra/40 group-hover:shadow-[0_0_0_1px_rgba(255,46,136,0.25),0_30px_60px_-20px_rgba(255,46,136,0.35)]"
      >
        <Link to={`/product/${product.id}`} data-testid={`product-link-${product.id}`} className="block">
          <div className="relative aspect-square overflow-hidden bg-stage">
            <img
              src={product.image}
              alt={product.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:rotate-1 group-hover:scale-110"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-sand/90 via-transparent to-transparent" />
            <span className={`absolute top-3 right-3 rounded-full border px-2.5 py-1 text-[11px] font-semibold backdrop-blur ${DIFFICULTY_STYLE[product.difficulty] ?? "bg-sand text-clay border-white/10"}`}>
              {product.difficulty}
            </span>
          </div>
        </Link>

        <div className="flex flex-1 flex-col gap-1.5 p-5" style={{ transform: "translateZ(30px)" }}>
          <h3 className="font-heading text-lg font-bold leading-snug">
            <Link to={`/product/${product.id}`} className="transition-colors hover:text-terra">{product.name}</Link>
          </h3>
          <p className="line-clamp-1 text-sm text-clay-soft">{product.tagline}</p>
          <div className="mt-auto flex items-center justify-between pt-3">
            <p className="-rotate-2 rounded-full bg-terra px-3 py-1 font-heading text-lg font-black text-white shadow-[0_0_18px_rgba(255,46,136,0.5)] transition-transform duration-300 group-hover:rotate-0">
              ₪{product.price}
            </p>
            <button
              type="button"
              onClick={quickAdd}
              data-testid={`quick-add-${product.id}`}
              aria-label={`הוספת ${product.name} לסל`}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-clay text-cream transition-all hover:bg-sage hover:shadow-[0_0_18px_rgba(34,230,255,0.6)] active:scale-90"
            >
              <Plus className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      </article>
    </TiltCard>
  );
}
