"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setChecking(false);
      if (!u) window.location.href = "/login";
    });
    return () => unsub();
  }, []);

  if (checking) {
    return (
      <main className="min-h-screen p-10">
        <div className="max-w-2xl">
          <div className="text-sm text-neutral-500">Checking session…</div>
        </div>
      </main>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}

