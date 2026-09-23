import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { apiGet } from "@/lib/api";
import type { Category, Product } from "@/lib/types";
import ProductCard from "@/components/ProductCard";
import { Reveal } from "@/components/Reveal";

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const active = params.get("cat") ?? "all";

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => apiGet<Category[]>("/categories"),
  });
  const { data: products, isLoading } = useQuery({
    queryKey: ["products", active],
    queryFn: () => apiGet<Product[]>(active === "all" ? "/products" : `/products?category=${active}`),
  });

  return (
    <div data-testid="shop-page" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
      <Reveal>
        <p className="text-xs font-bold tracking-[0.2em] text-terra">החנות</p>
        <h1 className="mt-3 font-heading text-4xl font-black sm:text-5xl">בוחרים בובה לצביעה</h1>
        <p className="mt-4 max-w-xl text-sm leading-7 text-clay-soft">
          כל בובה מגיעה לבנה, עם 6 צבעי אקריליק בטוחים, שני מכחולים ומדריך צביעה מצויר — הכול בקופסה אחת.
        </p>
      </Reveal>

      <div className="sticky top-16 z-30 -mx-4 mt-10 overflow-x-auto bg-cream/90 px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex gap-2" role="tablist" aria-label="קטגוריות">
          {(categories ?? [{ id: "all", name: "כל הבובות" }]).map((cat) => (
            <button
              key={cat.id}
              type="button"
              role="tab"
              aria-selected={active === cat.id}
              data-testid={`category-chip-${cat.id}`}
              onClick={() => setParams(cat.id === "all" ? {} : { cat: cat.id })}
              className={`shrink-0 rounded-full border px-5 py-2 text-sm font-medium transition-all active:scale-95 ${
                active === cat.id
                  ? "border-terra bg-terra text-white"
                  : "border-clay/15 bg-white text-clay hover:border-terra hover:text-terra"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] animate-pulse rounded-3xl bg-sand" />
          ))}
        </div>
      ) : (
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {(products ?? []).map((product, i) => (
            <Reveal key={product.id} delay={Math.min(i, 4) * 0.08}>
              <ProductCard product={product} />
            </Reveal>
          ))}
        </div>
      )}
      {!isLoading && (products ?? []).length === 0 && (
        <p className="mt-16 text-center text-sm text-clay-soft">אין בובות בקטגוריה הזו עדיין — בקרוב!</p>
      )}
    </div>
  );
}
