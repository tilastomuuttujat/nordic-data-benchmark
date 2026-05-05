export type PluginManifest = {
  id: string;
  version: string;
  title: string;
  slots: string[];
  entry: string;
  styles?: string;
  permissions?: string[];
};

export type EventHandler = (payload: unknown) => void;

export type EventBus = {
  on: (event: string, handler: EventHandler) => () => void;
  off: (event: string, handler: EventHandler) => void;
  emit: (event: string, payload?: unknown) => void;
};

export type DataLoader = {
  load: <T = unknown>(url: string, validate?: (raw: unknown) => T) => Promise<T>;
  invalidate: (url?: string) => void;
};

export type CoreApi = {
  events: EventBus;
  data: DataLoader;
  theme: { get: (cssVar: string) => string };
  log: (level: "info" | "warn" | "error", msg: string, ...rest: unknown[]) => void;
  pluginId: string;
};

export type PluginMountArgs = {
  container: HTMLElement;
  slot: string;
  core: CoreApi;
  manifest: PluginManifest;
};

export type PluginModule = {
  default: {
    mount: (args: PluginMountArgs) => void | Promise<void>;
    unmount?: (args: { container: HTMLElement }) => void;
  };
};
