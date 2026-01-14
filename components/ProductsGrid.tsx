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
import { db } from "@/lib/firebaseClient";

type Product = {
  sku: string;
  title: string;
  price: number;
  currency?: string;
  image?: string;
  url?: string;
  description?: string;
  updatedAt?: Timestamp | null; // serverTimestamp comes back as Timestamp
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
        // Prefer newest first. If you don't have updatedAt indexed yet, you can switch
        // orderBy("title", "asc") instead.
        const q = query(productsRef, orderBy("updatedAt", "desc"), limit(50));
        const snap = await getDocs(q);

        if (!alive) return;

        const rows = snap.docs.map((d) => ({ ...(d.data() as any) })) as Product[];
        setProducts(rows);
      } catch (e: any) {
        // Common causes:
        // - Missing composite index
        // - Firestore rules blocking reads
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
    <section style={{ marginTop: 24 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>Products</h2>
        <div style={{ opacity: 0.7 }}>{products.length} loaded</div>
      </div>

      {loading && <p style={{ marginTop: 12 }}>Loading products…</p>}

      {error && (
        <div
          style={{
            marginTop: 12,
            padding: 12,
            borderRadius: 8,
            border: "1px solid rgba(176,0,32,0.35)",
            background: "rgba(176,0,32,0.06)",
          }}
        >
          <div style={{ fontWeight: 800, color: "#b00020" }}>Error</div>
          <div style={{ marginTop: 6, whiteSpace: "pre-wrap" }}>{error}</div>
          <div style={{ marginTop: 10, opacity: 0.8 }}>
            If this mentions an index, open the error link in the console to
            create it automatically.
          </div>
        </div>
      )}

      {!loading && !error && products.length === 0 && (
        <p style={{ marginTop: 12 }}>No products found yet. Try /add.</p>
      )}

      {!loading && !error && products.length > 0 && (
        <div
          style={{
            marginTop: 16,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: 16,
          }}
        >
          {products.map((p) => (
            <article
              key={p.sku}
              style={{
                border: "1px solid rgba(0,0,0,0.12)",
                borderRadius: 12,
                overflow: "hidden",
                background: "#fff",
              }}
            >
              <div
                style={{
                  aspectRatio: "1 / 1",
                  background: "rgba(0,0,0,0.04)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {p.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.image}
                    alt={p.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <div style={{ opacity: 0.6, fontWeight: 700 }}>No image</div>
                )}
              </div>

              <div style={{ padding: 12 }}>
                <div style={{ fontWeight: 800, lineHeight: 1.2 }}>
                  {p.title}
                </div>

                <div style={{ marginTop: 8, fontWeight: 800 }}>
                  {formatPrice(p.price, p.currency)}
                </div>

                <div style={{ marginTop: 8, opacity: 0.7, fontSize: 12 }}>
                  SKU: <code>{p.sku}</code>
                </div>

                {p.url && (
                  <div style={{ marginTop: 10 }}>
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noreferrer"
                      style={{ fontWeight: 700, textDecoration: "underline" }}
                    >
                      View source
                    </a>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
