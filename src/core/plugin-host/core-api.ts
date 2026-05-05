import type { CoreApi, DataLoader, EventBus } from "./types";

export function buildCoreApi(opts: {
  pluginId: string;
  events: EventBus;
  data: DataLoader;
}): CoreApi {
  return {
    pluginId: opts.pluginId,
    events: opts.events,
    data: opts.data,
    theme: {
      get(cssVar) {
        if (typeof window === "undefined") return "";
        return getComputedStyle(document.documentElement).getPropertyValue(cssVar).trim();
      },
    },
    log(level, msg, ...rest) {
      const tag = `[plugin:${opts.pluginId}]`;
      // eslint-disable-next-line no-console
      console[level](tag, msg, ...rest);
    },
  };
}
