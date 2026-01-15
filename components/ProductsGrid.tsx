"use client";

import { useEffect, useMemo, useState } from "react";
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  Timestamp,
} from "firebase/firestore";
import Link from "next/link"; // ✅ ADD THIS
import { db } from "@/lib/firebaseClient";

type Product = {
  sku: string;
  title: string;
  price: number;
  currency?: string;
  image?: string;
  url?: string;
  description?: string;
  updatedAt?: Timestamp | null;
};

function formatPrice(price: number, currency?: string) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(price);
  } catch {
    return `$${price.toFixed(2)}`;
  }
}

export default function ProductsGrid() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const productsRef = useMemo(() => collection(db, "products"), []);

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const q = query(productsRef, orderBy("updatedAt", "desc"), limit(50));
        const snap = await getDocs(q);

        if (!alive) return;

        const rows = snap.docs.map((d) => ({ ...(d.data() as any) })) as Product[];
        setProducts(rows);
      } catch (e: any) {
        const msg =
          e?.message ||
          "Failed to load products. Check Firestore rules and indexes.";
        if (!alive) return;
        setError(msg);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [productsRef]);

  return (
    <section className="mt-6">
      <div className="flex items-baseline gap-3">
        <h2 className="text-xl font-extrabold m-0">Products</h2>
        <div className="text-sm text-muted-foreground">{products.length} loaded</div>
      </div>

      {loading && <p className="mt-3 text-sm text-muted-foreground">Loading products…</p>}

      {error && (
        <div className="mt-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
          <div className="font-extrabold text-destructive">Error</div>
          <div className="mt-1 whitespace-pre-wrap text-sm">{error}</div>
          <div className="mt-2 text-xs text-muted-foreground">
            If this mentions an index, open the error link in the console to create it automatically.
          </div>
        </div>
      )}

      {!loading && !error && products.length === 0 && (
        <p className="mt-3 text-sm text-muted-foreground">No products found yet. Try /add.</p>
      )}

      {!loading && !error && products.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            // ✅ LINK WRAPPER START
            <Link
              key={p.sku}
              href={`/product/${encodeURIComponent(p.sku)}`}
              className="group block"
            >
              <article className="overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-sm transition hover:shadow-md">
                <div className="aspect-square bg-muted overflow-hidden">
                  {p.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.image}
                      alt={p.title}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-muted-foreground">
                      No image
                    </div>
                  )}
                </div>

                <div className="p-3">
                  <div className="line-clamp-2 font-extrabold leading-snug">
                    {p.title}
                  </div>

                  <div className="mt-2 text-sm font-extrabold">
                    {formatPrice(p.price, p.currency)}
                  </div>

                  <div className="mt-2 text-xs text-muted-foreground">
                    SKU: <code className="rounded bg-muted px-1 py-0.5">{p.sku}</code>
                  </div>

                  {/* Optional: keep the source link, but prevent it from hijacking the card click */}
                  {p.url && (
                    <div className="mt-3">
                      <a
                        href={p.url}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs font-semibold underline underline-offset-2 text-muted-foreground hover:text-foreground"
                      >
                        View source
                      </a>
                    </div>
                  )}
                </div>
              </article>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
