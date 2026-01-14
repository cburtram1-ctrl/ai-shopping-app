"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebaseClient";
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";

export default function LoginPage() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setEmail(user?.email ?? null);
    });
    return () => unsub();
  }, []);

  const doLogin = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
    window.location.href = "/";
  };

  const doLogout = async () => {
    await signOut(auth);
  };

  return (
    <main className="min-h-screen p-10">
      <div className="max-w-lg">
        <h1 className="text-2xl font-semibold">Sign in</h1>
        <p className="mt-2 text-neutral-600">
          {email ? `Signed in as ${email}` : "Use Google to continue."}
        </p>

        <div className="mt-6 flex gap-3">
          {!email ? (
            <button className="px-4 py-2 rounded-xl border" onClick={doLogin}>
              Continue with Google
            </button>
          ) : (
            <button className="px-4 py-2 rounded-xl border" onClick={doLogout}>
              Sign out
            </button>
          )}
        </div>

        <div className="mt-8 text-sm text-neutral-500">
          After signing in, you can close this page and return to the homepage.
        </div>
      </div>
    </main>
  );
}

