import type { SupabaseChannelLike } from './types';

export interface PostgresChangesPayload<T = Record<string, unknown>> {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: T;
  old: T;
  schema?: string;
  table?: string;
}

export type PostgresChangesCallback<T = Record<string, unknown>> = (
  payload: PostgresChangesPayload<T>
) => void;

export interface InMemorySupabaseChannel<T = Record<string, unknown>> extends SupabaseChannelLike<T> {
  name: string;
  emitChange: (eventType: 'INSERT' | 'UPDATE' | 'DELETE', newRecord: T, oldRecord?: Partial<T>) => void;
  emitStatus: (status: 'SUBSCRIBED' | 'TIMED_OUT' | 'CLOSED' | 'CHANNEL_ERROR', err?: Error) => void;
  getListenerCount: () => number;
}

export interface InMemorySupabaseEmulator {
  channel: <T = Record<string, unknown>>(name: string) => InMemorySupabaseChannel<T>;
  clear: () => void;
}

/**
 * Creates an in-process, zero-dependency Supabase Realtime emulator.
 *
 * Implements Supabase channels, `postgres_changes` event dispatch, status subscriptions,
 * and lifecycle teardown with zero Docker containers or cloud projects needed.
 */
export function createInMemorySupabaseEmulator(): InMemorySupabaseEmulator {
  const channels = new Map<string, InMemorySupabaseChannel<unknown>>();

  const channel = <T = Record<string, unknown>>(name: string): InMemorySupabaseChannel<T> => {
    const existing = channels.get(name);
    if (existing) {
      return existing as unknown as InMemorySupabaseChannel<T>;
    }

    const listeners: Array<{ event: string; callback: PostgresChangesCallback<T> }> = [];
    let statusCallback: ((status: string, err?: Error) => void) | undefined;
    let isSubscribed = false;

    const ch: InMemorySupabaseChannel<T> = {
      name,
      on: (
        event: string,
        filter: Record<string, unknown>,
        callback: (payload: { new: T; old: T; eventType: string }) => void
      ) => {
        if (event === 'postgres_changes') {
          listeners.push({
            event: typeof filter.event === 'string' ? filter.event : '*',
            callback: callback as PostgresChangesCallback<T>,
          });
        }
        return ch;
      },
      subscribe: (cb?: (status: string, err?: Error) => void) => {
        statusCallback = cb;
        isSubscribed = true;
        queueMicrotask(() => {
          if (isSubscribed) {
            statusCallback?.('SUBSCRIBED');
          }
        });
        return ch;
      },
      unsubscribe: () => {
        isSubscribed = false;
        listeners.length = 0;
        statusCallback?.('CLOSED');
        channels.delete(name);
      },
      emitChange: (
        eventType: 'INSERT' | 'UPDATE' | 'DELETE',
        newRecord: T,
        oldRecord?: Partial<T>
      ) => {
        const payload: PostgresChangesPayload<T> = {
          eventType,
          new: newRecord,
          old: (oldRecord || {}) as T,
        };
        listeners.forEach((listener) => {
          if (listener.event === '*' || listener.event === payload.eventType) {
            listener.callback(payload);
          }
        });
      },
      emitStatus: (status: 'SUBSCRIBED' | 'TIMED_OUT' | 'CLOSED' | 'CHANNEL_ERROR', err?: Error) => {
        statusCallback?.(status, err);
      },
      getListenerCount: () => listeners.length,
    };

    channels.set(name, ch as unknown as InMemorySupabaseChannel<unknown>);
    return ch;
  };

  const clear = () => {
    channels.forEach((ch) => ch.unsubscribe());
    channels.clear();
  };

  return {
    channel,
    clear,
  };
}
