import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/_authenticated/my")({
  component: () => (
    <div className="min-h-screen bg-night">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-6 pt-32"><h1 className="text-5xl">Coming soon</h1></main>
    </div>
  ),
});
