import { onCall, HttpsError } from "firebase-functions/v2/https";
import { initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

initializeApp();

type Product = {
  sku: string;
  title: string;
  price: number;
  currency?: string;
  url?: string;
  image?: string;
  description?: string;
};

function normalizeProduct(raw: any): Product {
  if (!raw || typeof raw !== "object") throw new Error("Product is not an object");

  const sku = String(raw.sku ?? "").trim();
  const title = String(raw.title ?? "").trim();
  const price = Number(raw.price);

  if (!sku) throw new Error("Missing sku");
  if (!title) throw new Error("Missing title");
  if (!Number.isFinite(price)) throw new Error("Invalid price");

  const currency = raw.currency ? String(raw.currency).trim() : undefined;
  const url = raw.url ? String(raw.url).trim() : undefined;
  const image = raw.image ? String(raw.image).trim() : undefined;
  const description = raw.description ? String(raw.description).trim() : undefined;

  return { sku, title, price, currency, url, image, description };
}

function extractProducts(payload: any): any[] {
  // Supports:
  // A) { products: [...] }
  // B) [ ... ]
  // C) { ...singleProduct }
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.products)) return payload.products;
  if (payload && typeof payload === "object") return [payload];
  return [];
}

export const ingestProductUrl = onCall(
  { region: "us-central1", timeoutSeconds: 60 },
  async (request) => {
    // Recommended: require auth so randos can't hammer your function
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Login required");
    }

    const url = String(request.data?.url ?? "").trim();
    if (!url) throw new HttpsError("invalid-argument", "Missing url");
    if (!/^https?:\/\//i.test(url)) {
      throw new HttpsError("invalid-argument", "URL must start with http/https");
    }

    let res: Response;
    try {
      res = await fetch(url, {
        redirect: "follow",
        headers: { accept: "application/json,text/plain,*/*" },
      });
    } catch (e: any) {
      throw new HttpsError("unavailable", `Fetch failed: ${e?.message ?? String(e)}`);
    }

    if (!res.ok) {
      throw new HttpsError("failed-precondition", `HTTP ${res.status} from ${url}`);
    }

    let payload: any;
    try {
      payload = await res.json();
    } catch {
      throw new HttpsError("failed-precondition", "Response was not valid JSON");
    }

    const rawProducts = extractProducts(payload);
    if (!rawProducts.length) {
      throw new HttpsError("failed-precondition", "No products found in JSON payload");
    }

    let products: Product[];
    try {
      products = rawProducts.map(normalizeProduct);
    } catch (e: any) {
      throw new HttpsError("invalid-argument", `Invalid product schema: ${e?.message ?? e}`);
    }

    // Write to Firestore: products/{sku}
    const db = getFirestore();
    const batch = db.batch();

    for (const p of products) {
      const ref = db.collection("products").doc(p.sku);
      batch.set(
        ref,
        {
          ...p,
          sourceUrl: url,
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    }

    await batch.commit();

    return {
      ok: true,
      count: products.length,
      skus: products.map((p) => p.sku),
    };
  }
);

