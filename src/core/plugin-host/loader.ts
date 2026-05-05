import type { PluginManifest, PluginModule } from "./types";

const moduleCache = new Map<string, Promise<PluginModule>>();
const styleInjected = new Set<string>();

export function injectStyles(manifest: PluginManifest) {
  if (!manifest.styles || styleInjected.has(manifest.id)) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = manifest.styles;
  link.dataset.pluginId = manifest.id;
  document.head.appendChild(link);
  styleInjected.add(manifest.id);
}

export function loadPluginModule(manifest: PluginManifest): Promise<PluginModule> {
  let p = moduleCache.get(manifest.id);
  if (!p) {
    p = import(/* @vite-ignore */ manifest.entry) as Promise<PluginModule>;
    moduleCache.set(manifest.id, p);
  }
  return p;
}
