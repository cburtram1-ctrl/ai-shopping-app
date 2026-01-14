import { onRequest } from "firebase-functions/v2/https";
import { initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import fetch from "node-fetch";

initializeApp();
const db = getFirestore();

export const ingestProductsFromUrl = onRequest(
  { cors: true, timeoutSeconds: 60 },
  async (req, res) => {
    const { url } = req.body;

    if (!url) {
      res.status(400).json({ error: "Missing url" });
      return;
    }

    const r = await fetch(url);
    const data = await r.json();

    if (!Array.isArray(data)) {
      res.status(400).json({ error: "Expected JSON array" });
      return;
    }

    const batch = db.batch();
    const now = FieldValue.serverTimestamp();

    for (const raw of data) {
      if (!raw.sku) continue;
      batch.set(
        db.collection("products").doc(String(raw.sku)),
        {
          ...raw,
          updatedAt: now,
          createdAt: now,
        },
        { merge: true }
      );
    }

    await batch.commit();

    res.json({ ok: true, ingested: data.length });
  }
);
