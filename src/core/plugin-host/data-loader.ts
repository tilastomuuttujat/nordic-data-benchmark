import type { DataLoader } from "./types";

export function createDataLoader(): DataLoader {
  const cache = new Map<string, Promise<unknown>>();

  return {
    load<T = unknown>(url: string, validate?: (raw: unknown) => T): Promise<T> {
      let entry = cache.get(url) as Promise<T> | undefined;
      if (!entry) {
        entry = fetch(url)
          .then((r) => {
            if (!r.ok) throw new Error(`Fetch failed for ${url}: ${r.status}`);
            return r.json();
          })
          .then((raw) => (validate ? validate(raw) : (raw as T)))
          .catch((err) => {
            cache.delete(url);
            throw err;
          });
        cache.set(url, entry);
      }
      return entry;
    },
    invalidate(url) {
      if (url) cache.delete(url);
      else cache.clear();
    },
  };
}
