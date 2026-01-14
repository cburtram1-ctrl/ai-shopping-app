
import AuthGate from "@/components/AuthGate";
import IngestTest from "@/components/IngestTest";


export default function Home() {
  return (
    <AuthGate>
      <main className="min-h-screen px-8 py-10">
        <div className="mx-auto max-w-5xl">
          <header className="mb-10">
            <div className="text-xs tracking-widest text-neutral-500">
              AI SHOPPING EDITOR
            </div>
                  <h1>Home</h1>
      <IngestTest />
            <h1 className="mt-3 text-3xl font-semibold tracking-tight">
              A small set of items worth noticing today.
            </h1>
            <p className="mt-2 max-w-2xl text-neutral-600">
              Minimal noise. High alignment. The system learns quietly from what you save and dismiss.
            </p>
          </header>

          <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Placeholder cards (we’ll replace with real feed docs next) */}
            {Array.from({ length: 6 }).map((_, i) => (
              <article
                key={i}
                className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm"
              >
                <div className="aspect-[4/3] w-full rounded-xl bg-neutral-100" />
                <div className="mt-4">
                  <div className="h-4 w-3/4 rounded bg-neutral-100" />
                  <div className="mt-2 h-4 w-1/2 rounded bg-neutral-100" />
                  <div className="mt-4 h-3 w-full rounded bg-neutral-100" />
                  <div className="mt-2 h-3 w-5/6 rounded bg-neutral-100" />
                </div>
                <div className="mt-5 flex gap-2">
                  <button className="flex-1 rounded-xl border px-3 py-2 text-sm">
                    Save
                  </button>
                  <button className="flex-1 rounded-xl border px-3 py-2 text-sm">
                    Dismiss
                  </button>
                </div>
              </article>
            ))}
          </section>

          <footer className="mt-12 text-sm text-neutral-500">
            Tip: Start by adding products and onboarding taste. The feed will get shorter as confidence rises.
          </footer>
        </div>
      </main>
    </AuthGate>
  );
}

