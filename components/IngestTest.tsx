"use client";

import { getFunctions, httpsCallable } from "firebase/functions";
import { app as firebaseApp } from "@/lib/firebaseClient";

export default function IngestTest() {
  const runTest = async () => {
    try {
      const fn = httpsCallable(
        getFunctions(firebaseApp, "us-central1"),
        "ingestProductUrl"
      );

      const result = await fn({
        url: "https://ai-shopping-app.vercel.app/products.json"
      });

      console.log("Ingest result:", result.data);
      alert("Success! Check console + Firestore.");
    } catch (err: any) {
      console.error("Ingest failed:", err);
      alert(err.message ?? "Ingest failed");
    }
  };

  return (
    <button
      onClick={runTest}
      style={{
        padding: "12px 16px",
        background: "#000",
        color: "#fff",
        borderRadius: 6,
        marginTop: 24
      }}
    >
      Test ingestProductUrl
    </button>
  );
}

