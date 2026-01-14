"use client";

import { useMemo, useState } from "react";
import { httpsCallable } from "firebase/functions";
import AuthGate from "@/components/AuthGate"; // adjust path if yours differs
import { functions } from "@/lib/firebaseClient";

type IngestResponse =
  | {
      ok: true;
      count: number;
      skus: string[];
    }
  | any;

function AddPageInner() {
  const defaultUrl = useMemo(() => {
    // Optional convenience: prefill with your live JSON endpoint if you want
    return "";
  }, []);

  const [url, setUrl] = useState(defaultUrl);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<IngestResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runIngest = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const ingest = httpsCallable(functions, "ingestProductUrl");
      const res = await ingest({ url: url.trim() });

      setResult(res.data);
    } catch (e: any) {
      // Firebase callable errors usually have e.code / e.message
      const msg =
        e?.message ||
        e?.details ||
        (typeof e === "string" ? e : "Unknown error");
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const isValidUrl = /^https?:\/\//i.test(url.trim());

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>Add Products</h1>
      <p style={{ marginTop: 8, opacity: 0.85 }}>
        Paste a URL to a JSON feed (e.g. your Vercel <code>/products.json</code>)
        and ingest it into Firestore via <code>ingestProductUrl</code>.
      </p>

      <div style={{ marginTop: 24 }}>
        <label style={{ display: "block", fontWeight: 600, marginBottom: 8 }}>
          Products feed URL
        </label>

        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://your-site.vercel.app/products.json"
          style={{
            width: "100%",
            padding: "12px 12px",
            borderRadius: 8,
            border: "1px solid rgba(0,0,0,0.2)",
            fontSize: 14,
          }}
        />

        <div style={{ marginTop: 12, display: "flex", gap: 12 }}>
          <button
            onClick={runIngest}
            disabled={isLoading || !isValidUrl}
            style={{
              padding: "12px 16px",
              borderRadius: 8,
              border: "none",
              background: isLoading || !isValidUrl ? "#888" : "#000",
              color: "#fff",
              cursor: isLoading || !isValidUrl ? "not-allowed" : "pointer",
              fontWeight: 700,
            }}
          >
            {isLoading ? "Ingesting…" : "Ingest"}
          </button>

          <button
            onClick={() => {
              setUrl(defaultUrl);
              setResult(null);
              setError(null);
            }}
            disabled={isLoading}
            style={{
              padding: "12px 16px",
              borderRadius: 8,
              border: "1px solid rgba(0,0,0,0.25)",
              background: "#fff",
              cursor: isLoading ? "not-allowed" : "pointer",
              fontWeight: 600,
            }}
          >
            Reset
          </button>
        </div>

        {!isValidUrl && url.trim().length > 0 && (
          <p style={{ marginTop: 10, color: "#b00020", fontWeight: 600 }}>
            URL must start with http:// or https://
          </p>
        )}

        {error && (
          <div
            style={{
              marginTop: 16,
              padding: 12,
              borderRadius: 8,
              border: "1px solid rgba(176,0,32,0.35)",
              background: "rgba(176,0,32,0.06)",
            }}
          >
            <div style={{ fontWeight: 800, color: "#b00020" }}>Error</div>
            <div style={{ marginTop: 6, whiteSpace: "pre-wrap" }}>{error}</div>
          </div>
        )}

        {result && (
          <div
            style={{
              marginTop: 16,
              padding: 12,
              borderRadius: 8,
              border: "1px solid rgba(0,0,0,0.15)",
              background: "rgba(0,0,0,0.03)",
            }}
          >
            <div style={{ fontWeight: 800 }}>Result</div>
            <pre
              style={{
                marginTop: 8,
                overflowX: "auto",
                padding: 12,
                borderRadius: 8,
                background: "#fff",
                border: "1px solid rgba(0,0,0,0.08)",
              }}
            >
              {JSON.stringify(result, null, 2)}
            </pre>

            {result?.ok && Array.isArray(result?.skus) && (
              <div style={{ marginTop: 10 }}>
                <div style={{ fontWeight: 700 }}>
                  Ingested {result.count} product(s)
                </div>
                <ul style={{ marginTop: 8 }}>
                  {result.skus.map((sku: string) => (
                    <li key={sku}>
                      <code>{sku}</code>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

export default function AddPage() {
  // This assumes you already have an AuthGate component that blocks/redirects unauthenticated users.
  return (
    <AuthGate>
      <AddPageInner />
    </AuthGate>
  );
}

