/**
 * AppEvents — the exhaustive map of all global application events.
 * Extend this union when adding new event types; never use raw strings
 * as event names outside this module.
 */
export type AppEventName = 'FORCE_LOGOUT';

/**
 * AppEventPayloads — maps each event name to its payload type.
 * Events with no data use `void` so callers cannot pass unexpected arguments.
 */
export interface AppEventPayloads {
  FORCE_LOGOUT: void;
}

type Listener<T> = T extends void ? () => void : (payload: T) => void;

type ListenerMap = {
  [K in AppEventName]: Set<Listener<AppEventPayloads[K]>>;
};

/**
 * EventBus — a lightweight, fully-typed pub/sub system for cross-module
 * communication that avoids circular imports.
 *
 * Usage:
 *   eventBus.on('FORCE_LOGOUT', () => { ... });
 *   eventBus.emit('FORCE_LOGOUT');
 *   eventBus.off('FORCE_LOGOUT', handler);
 */
class EventBus {
  private readonly listeners: ListenerMap = {
    FORCE_LOGOUT: new Set(),
  };

  on<K extends AppEventName>(event: K, listener: Listener<AppEventPayloads[K]>): void {
    (this.listeners[event] as Set<Listener<AppEventPayloads[K]>>).add(listener);
  }

  off<K extends AppEventName>(event: K, listener: Listener<AppEventPayloads[K]>): void {
    (this.listeners[event] as Set<Listener<AppEventPayloads[K]>>).delete(listener);
  }

  emit<K extends AppEventName>(
    ...args: AppEventPayloads[K] extends void ? [event: K] : [event: K, payload: AppEventPayloads[K]]
  ): void {
    const [event, payload] = args as [K, AppEventPayloads[K]];
    const set = this.listeners[event] as Set<Listener<AppEventPayloads[K]>>;
    set.forEach((listener) => {
      if (payload === undefined) {
        (listener as () => void)();
      } else {
        (listener as (p: AppEventPayloads[K]) => void)(payload);
      }
    });
  }
}

export const eventBus = new EventBus();
