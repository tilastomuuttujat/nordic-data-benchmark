import type { PluginManifest } from "./types";

const REGISTRY_URL = "/plugins/index.json";

export type RegistryEntry = { dir: string };

export async function loadRegistry(): Promise<PluginManifest[]> {
  const res = await fetch(REGISTRY_URL, { cache: "no-cache" });
  if (!res.ok) throw new Error(`Failed to load plugin registry (${res.status})`);
  const list = (await res.json()) as RegistryEntry[];

  const manifests = await Promise.all(
    list.map(async (entry) => {
      const url = `/plugins/${entry.dir}/manifest.json`;
      const r = await fetch(url, { cache: "no-cache" });
      if (!r.ok) throw new Error(`Manifest missing: ${url}`);
      const m = (await r.json()) as PluginManifest;
      // Resolve relative entry/styles against the plugin dir
      m.entry = new URL(m.entry, `${location.origin}/plugins/${entry.dir}/`).pathname;
      if (m.styles) {
        m.styles = new URL(m.styles, `${location.origin}/plugins/${entry.dir}/`).pathname;
      }
      return m;
    }),
  );

  return manifests;
}
