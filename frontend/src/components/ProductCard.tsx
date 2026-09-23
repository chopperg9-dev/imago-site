import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/lib/cart";
import type { Product } from "@/lib/types";

const DIFFICULTY_STYLE: Record<string, string> = {
  "קל": "bg-sage-soft text-sage-deep",
  "בינוני": "bg-terra-soft text-terra-deep",
  "מתקדם": "bg-clay text-cream",
};

export default function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();

  const quickAdd = () => {
    add({ key: product.id, name: product.name, price: product.price, image: product.image });
    toast.success(`${product.name} נוספה לסל`);
  };

  return (
    <article
      data-testid={`product-card-${product.id}`}
      className="group relative flex flex-col overflow-hidden rounded-3xl border border-clay/10 bg-white transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_48px_-20px_rgba(44,34,30,0.3)]"
    >
      <Link to={`/product/${product.id}`} data-testid={`product-link-${product.id}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-sand">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
          <span
            className={`absolute top-3 right-3 rounded-full px-2.5 py-1 text-[11px] font-semibold ${DIFFICULTY_STYLE[product.difficulty] ?? "bg-sand text-clay"}`}
          >
            {product.difficulty}
          </span>
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-1.5 p-5">
        <h3 className="font-heading text-lg font-bold leading-snug">
          <Link to={`/product/${product.id}`} className="transition-colors hover:text-terra">
            {product.name}
          </Link>
        </h3>
        <p className="line-clamp-1 text-sm text-clay-soft">{product.tagline}</p>
        <div className="mt-auto flex items-center justify-between pt-3">
          <p className="font-heading text-xl font-black">₪{product.price}</p>
          <button
            type="button"
            onClick={quickAdd}
            data-testid={`quick-add-${product.id}`}
            aria-label={`הוספת ${product.name} לסל`}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-clay text-cream transition-all hover:bg-terra active:scale-90"
          >
            <Plus className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>
    </article>
  );
}
