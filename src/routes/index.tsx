import { createFileRoute } from "@tanstack/react-router";
import { PluginHostProvider, Slot, usePluginHost } from "@/core/plugin-host/PluginHost";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <PluginHostProvider>
      <div className="min-h-screen bg-background text-foreground">
        <header className="border-b">
          <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
            <h1 className="text-lg font-semibold tracking-tight">Plugin-ydin · demo</h1>
            <RegistryStatus />
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-6 py-8 grid gap-8 md:grid-cols-[1fr_280px]">
          <section>
            <h2 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">
              dashboard.widgets
            </h2>
            <Slot name="dashboard.widgets" className="grid gap-4 sm:grid-cols-2" />
          </section>

          <aside>
            <h2 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">
              sidebar.menu
            </h2>
            <Slot name="sidebar.menu" className="grid gap-3" />
          </aside>
        </main>

        <footer className="max-w-6xl mx-auto px-6 py-8 text-xs text-muted-foreground">
          Lisäosat: <code>public/plugins/</code> · Rekisteri:{" "}
          <code>public/plugins/index.json</code> · Ohje: <code>public/plugins/README.md</code>
        </footer>
      </div>
    </PluginHostProvider>
  );
}

function RegistryStatus() {
  const host = usePluginHost();
  if (!host.ready) return <span className="text-xs text-muted-foreground">Ladataan…</span>;
  if (host.error)
    return <span className="text-xs text-destructive">Rekisteri-virhe: {host.error}</span>;
  return (
    <span className="text-xs text-muted-foreground">
      {host.manifests.length} lisäosaa ladattu
    </span>
  );
}
