import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/lib/cart";
import type { Product } from "@/lib/types";
import TiltCard from "@/components/TiltCard";

const DIFFICULTY_STYLE: Record<string, string> = {
  "קל": "text-sage-deep border-sage/40",
  "בינוני": "text-terra-deep border-terra/40",
  "מתקדם": "text-mustard border-mustard/40",
};

export default function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { add } = useCart();

  const quickAdd = () => {
    add({ key: product.id, name: product.name, price: product.price, image: product.image });
    toast.success(`${product.name} נוספה לסל`);
  };

  return (
    <TiltCard className="group h-full" max={10}>
      <article data-testid={`product-card-${product.id}`} className="relative flex h-full flex-col">
        <Link to={`/product/${product.id}`} data-testid={`product-link-${product.id}`} className="block">
          <div className="relative aspect-square [transform-style:preserve-3d]">
            <div className="pointer-events-none absolute bottom-6 left-1/2 h-10 w-3/4 -translate-x-1/2 rounded-[100%] bg-terra/35 blur-2xl transition-all duration-500 group-hover:bg-sage/40 group-hover:blur-3xl" />
            <img
              src={product.image}
              alt={product.name}
              loading="lazy"
              className="animate-float relative h-full w-full object-cover transition-transform duration-700 ease-out [mask-image:radial-gradient(ellipse_at_center,black_52%,transparent_74%)] group-hover:scale-110"
              style={{ animationDelay: `${(index % 5) * -1.2}s`, transform: "translateZ(40px)" }}
            />
            <span className={`absolute top-2 right-2 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${DIFFICULTY_STYLE[product.difficulty] ?? "text-clay border-white/20"}`}>
              {product.difficulty}
            </span>
          </div>
        </Link>

        <div className="flex flex-1 flex-col gap-1.5 px-2 pt-1" style={{ transform: "translateZ(24px)" }}>
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
