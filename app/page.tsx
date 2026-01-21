import Link from "next/link";
import AuthGate from "@/components/AuthGate";
import ProductsGrid from "@/components/ProductsGrid";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function Home() {
  return (
    <AuthGate>
      <main className="min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="text-xs font-semibold tracking-widest text-muted-foreground">
                AI SHOPPING EDITOR
              </div>
            </div>

            <nav className="flex items-center gap-2">
              <Button variant="ghost" asChild>
                <Link href="/">Home</Link>
              </Button>

              <Button asChild>
                <Link href="/add">Add products</Link>
              </Button>
            </nav>
          </div>
        </header>

        {/* Page content */}
        <div className="mx-auto max-w-6xl px-6 py-10">
          <Card className="rounded-2xl">
            <CardHeader className="space-y-2">
              <div className="text-xs tracking-widest text-muted-foreground">
                DAILY FEED
              </div>
              <CardTitle className="text-3xl font-semibold tracking-tight">
                A small set of items worth noticing today.
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="max-w-2xl text-sm text-muted-foreground">
                Minimal noise. High alignment. The system learns quietly from what
                you save and dismiss.
              </p>

              <div className="flex flex-wrap items-center gap-2">
                <Button asChild>
                  <Link href="/add">Ingest from URL</Link>
                </Button>

                <Button variant="outline" asChild>
                  <Link href="/add">Add another feed</Link>
                </Button>

                {/* Future: Saved / Profile / Settings */}
                {/* <Button variant="ghost" asChild><Link href="/saved">Saved</Link></Button> */}
              </div>
            </CardContent>
          </Card>

          <Separator className="my-8" />

          {/* ProductsGrid already includes its own grid */}
          <ProductsGrid />

          <footer className="mt-12 text-sm text-muted-foreground">
            Tip: Start by adding products and onboarding taste. The feed will get
            shorter as confidence rises.
          </footer>
        </div>
      </main>
    </AuthGate>
  );
}
