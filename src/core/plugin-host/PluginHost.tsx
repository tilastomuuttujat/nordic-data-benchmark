import * as React from "react";
import { createEventBus } from "./event-bus";
import { createDataLoader } from "./data-loader";
import { loadRegistry } from "./registry";
import { injectStyles, loadPluginModule } from "./loader";
import { buildCoreApi } from "./core-api";
import type { PluginManifest } from "./types";

type HostState = {
  manifests: PluginManifest[];
  ready: boolean;
  error: string | null;
};

type HostContextValue = HostState & {
  events: ReturnType<typeof createEventBus>;
  data: ReturnType<typeof createDataLoader>;
};

const HostContext = React.createContext<HostContextValue | null>(null);

export function PluginHostProvider({ children }: { children: React.ReactNode }) {
  const eventsRef = React.useRef(createEventBus());
  const dataRef = React.useRef(createDataLoader());
  const [state, setState] = React.useState<HostState>({
    manifests: [],
    ready: false,
    error: null,
  });

  React.useEffect(() => {
    let cancelled = false;
    loadRegistry()
      .then((manifests) => {
        if (cancelled) return;
        setState({ manifests, ready: true, error: null });
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setState({ manifests: [], ready: true, error: err.message });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const value = React.useMemo<HostContextValue>(
    () => ({ ...state, events: eventsRef.current, data: dataRef.current }),
    [state],
  );

  return <HostContext.Provider value={value}>{children}</HostContext.Provider>;
}

export function usePluginHost() {
  const ctx = React.useContext(HostContext);
  if (!ctx) throw new Error("usePluginHost must be used inside PluginHostProvider");
  return ctx;
}

export function Slot({ name, className }: { name: string; className?: string }) {
  const host = usePluginHost();
  const matching = React.useMemo(
    () => host.manifests.filter((m) => m.slots.includes(name)),
    [host.manifests, name],
  );

  if (!host.ready) {
    return <div className={className} data-slot={name} aria-busy="true" />;
  }

  return (
    <div className={className} data-slot={name}>
      {matching.map((m) => (
        <PluginMount key={m.id} manifest={m} slot={name} />
      ))}
      {matching.length === 0 && (
        <div className="text-sm text-muted-foreground italic">
          Ei lisäosia slotissa "{name}"
        </div>
      )}
    </div>
  );
}

function PluginMount({ manifest, slot }: { manifest: PluginManifest; slot: string }) {
  const host = usePluginHost();
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const unmountRef = React.useRef<(() => void) | null>(null);

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let cancelled = false;

    (async () => {
      try {
        injectStyles(manifest);
        const mod = await loadPluginModule(manifest);
        if (cancelled) return;
        const core = buildCoreApi({
          pluginId: manifest.id,
          events: host.events,
          data: host.data,
        });
        await mod.default.mount({ container, slot, core, manifest });
        unmountRef.current = () => {
          try {
            mod.default.unmount?.({ container });
          } catch (err) {
            console.error(`[plugin-host] unmount failed for ${manifest.id}`, err);
          }
        };
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`[plugin-host] failed to mount ${manifest.id}`, err);
        if (!cancelled) setError(msg);
      }
    })();

    return () => {
      cancelled = true;
      unmountRef.current?.();
      unmountRef.current = null;
      if (container) container.innerHTML = "";
    };
  }, [manifest, slot, host.events, host.data]);

  return (
    <div className="plugin-mount" data-plugin-id={manifest.id}>
      {error && (
        <div className="text-sm text-destructive border border-destructive/30 rounded p-2">
          Lisäosa "{manifest.id}" epäonnistui: {error}
        </div>
      )}
      <div ref={containerRef} />
    </div>
  );
}
