import type { EventBus, EventHandler } from "./types";

export function createEventBus(): EventBus {
  const handlers = new Map<string, Set<EventHandler>>();

  return {
    on(event, handler) {
      let set = handlers.get(event);
      if (!set) {
        set = new Set();
        handlers.set(event, set);
      }
      set.add(handler);
      return () => this.off(event, handler);
    },
    off(event, handler) {
      handlers.get(event)?.delete(handler);
    },
    emit(event, payload) {
      handlers.get(event)?.forEach((h) => {
        try {
          h(payload);
        } catch (err) {
          console.error(`[plugin-host] event "${event}" handler failed`, err);
        }
      });
    },
  };
}
