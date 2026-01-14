
import AuthGate from "@/components/AuthGate";
import ProductsGrid from "@/components/ProductsGrid";

export default function Home() {
  return (
    <AuthGate>
      <main className="min-h-screen px-8 py-10">
        <div className="mx-auto max-w-5xl">
          <header className="mb-10">
            <div className="text-xs tracking-widest text-neutral-500">
              AI SHOPPING EDITOR
            </div>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight">
              A small set of items worth noticing today.
            </h1>
            <p className="mt-2 max-w-2xl text-neutral-600">
              Minimal noise. High alignment. The system learns quietly from what you save and dismiss.
            </p>
          </header>

          <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Placeholder cards (we’ll replace with real feed docs next) */}
        <ProductsGrid />
          </section>

          <footer className="mt-12 text-sm text-neutral-500">
            Tip: Start by adding products and onboarding taste. The feed will get shorter as confidence rises.
          </footer>
        </div>
      </main>
    </AuthGate>
  );
}

