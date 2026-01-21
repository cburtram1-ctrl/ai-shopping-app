"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { doc, getDoc, Timestamp, DocumentReference } from "firebase/firestore";

import AuthGate from "@/components/AuthGate";
import { db } from "@/lib/firebaseClient";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type Product = {
  sku: string;
  title: string;
  price: number;
  currency?: string;
  image?: string;
  url?: string;
  description?: string;
  updatedAt?: Timestamp | null;
  sourceUrl?: string;
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

export default function ProductDetailClient({ sku }: { sku: string }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const safeSku = typeof sku === "string" ? sku : "";

  const productRef = useMemo(() => {
    if (!safeSku) return null as DocumentReference | null;
    return doc(db, "products", safeSku);
  }, [safeSku]);

useEffect(() => {
  if (!productRef) {
    setLoading(false);
    setError("Missing product SKU in the URL.");
    return;
  }

  let alive = true;
  const ref = productRef; // capture non-null ref

  async function load() {
    setLoading(true);
    setError(null);

    try {
      const snap = await getDoc(ref);
      if (!alive) return;

      if (!snap.exists()) {
        setProduct(null);
        setError("Product not found.");
        return;
      }

      setProduct(snap.data() as Product);
    } catch (e: any) {
      if (!alive) return;
      setError(e?.message || "Failed to load product.");
    } finally {
      if (!alive) return;
      setLoading(false);
    }
  }

  load();

  return () => {
    alive = false;
  };
}, [productRef]);


  // ✅ JSX returned from component (correct place)
  return (
    <AuthGate>
      <main className="min-h-screen">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button variant="ghost" asChild>
              <Link href="/">← Back</Link>
            </Button>

            <div className="flex items-center gap-2">
              {product?.url && (
                <Button asChild>
                  <a href={product.url} target="_blank" rel="noreferrer">
                    View source
                  </a>
                </Button>
              )}
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <Card className="overflow-hidden rounded-2xl">
              <CardContent className="p-0">
                <div className="aspect-square w-full bg-muted">
                  {product?.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.image}
                      alt={product.title || safeSku}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-muted-foreground">
                      No image
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl">
              <CardHeader className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    SKU: {safeSku || "—"}
                  </Badge>
                  {product?.currency && (
                    <Badge variant="outline" className="text-xs">
                      {product.currency}
                    </Badge>
                  )}
                </div>

                {loading ? (
                  <CardTitle className="text-2xl">Loading…</CardTitle>
                ) : error ? (
                  <CardTitle className="text-2xl text-destructive">
                    {error}
                  </CardTitle>
                ) : (
                  <CardTitle className="text-3xl font-semibold tracking-tight">
                    {product?.title}
                  </CardTitle>
                )}
              </CardHeader>

              <CardContent className="space-y-5">
                {loading && (
                  <div className="text-sm text-muted-foreground">
                    Fetching from Firestore…
                  </div>
                )}

                {!loading && !error && product && (
                  <>
                    <div className="text-2xl font-extrabold">
                      {formatPrice(product.price, product.currency)}
                    </div>

                    <Separator />

                    {product.description ? (
                      <p className="text-sm leading-relaxed text-foreground/90">
                        {product.description}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No description yet. (We can generate an AI summary next.)
                      </p>
                    )}

                    {(product.sourceUrl || product.url) && (
                      <div className="text-xs text-muted-foreground">
                        Source:{" "}
                        <code className="rounded bg-muted px-1 py-0.5">
                          {product.sourceUrl || product.url}
                        </code>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </AuthGate>
  );
}
