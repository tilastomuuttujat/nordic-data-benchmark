import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  PluginHostProvider,
  PluginView,
  usePluginHost,
} from "@/core/plugin-host/PluginHost";

export const Route = createFileRoute("/plugins")({
  component: Index,
});

function Index() {
  return (
    <PluginHostProvider>
      <Shell />
    </PluginHostProvider>
  );
}

function Shell() {
  const host = usePluginHost();
  const [selected, setSelected] = useState<string | null>(null);

  // Auto-select first plugin once registry loads
  const activeId =
    selected ?? (host.ready && host.manifests[0] ? host.manifests[0].id : null);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold tracking-tight">
            Plugin-käynnistin
          </h1>
          <span className="text-xs text-muted-foreground">
            {host.ready
              ? host.error
                ? `Virhe: ${host.error}`
                : `${host.manifests.length} lisäosaa`
              : "Ladataan…"}
          </span>
        </div>
      </header>

      <div className="flex-1 max-w-6xl w-full mx-auto px-6 py-6 grid gap-6 md:grid-cols-[240px_1fr]">
        <nav aria-label="Lisäosat" className="border rounded-lg p-2 h-fit">
          <div className="text-xs font-medium text-muted-foreground px-2 py-1 uppercase tracking-wider">
            Lisäosat
          </div>
          {host.ready && host.manifests.length === 0 && (
            <div className="text-sm text-muted-foreground p-2">
              Ei lisäosia rekisterissä.
            </div>
          )}
          <ul className="flex flex-col gap-1 mt-1">
            {host.manifests.map((m) => {
              const isActive = m.id === activeId;
              return (
                <li key={m.id}>
                  <button
                    type="button"
                    onClick={() => setSelected(m.id)}
                    className={
                      "w-full text-left px-3 py-2 rounded-md text-sm transition-colors " +
                      (isActive
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted")
                    }
                  >
                    <div className="font-medium">{m.title}</div>
                    <div
                      className={
                        "text-xs " +
                        (isActive
                          ? "text-primary-foreground/80"
                          : "text-muted-foreground")
                      }
                    >
                      v{m.version} · {m.id}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <main className="border rounded-lg p-4 min-h-[400px]">
          {activeId ? (
            <PluginView manifestId={activeId} slot="main" />
          ) : (
            <div className="text-sm text-muted-foreground">
              Valitse lisäosa vasemmalta.
            </div>
          )}
        </main>
      </div>

      <footer className="max-w-6xl mx-auto px-6 py-6 text-xs text-muted-foreground">
        Lisää uusi: pudota kansio <code>public/plugins/</code> alle ja lisää sen
        nimi tiedostoon <code>public/plugins/index.json</code>.
      </footer>
    </div>
  );
}
