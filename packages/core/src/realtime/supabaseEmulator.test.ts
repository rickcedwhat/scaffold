import { describe, it, expect, vi } from 'vitest';
import { createInMemorySupabaseEmulator } from './supabaseEmulator';

describe('createInMemorySupabaseEmulator', () => {
  it('subscribes to channels and dispatches postgres_changes', async () => {
    const supabase = createInMemorySupabaseEmulator();
    const channel = supabase.channel<{ id: string; title: string }>('todos');

    const listener = vi.fn();
    const statusListener = vi.fn();

    channel.on('postgres_changes', { event: '*', schema: 'public' }, listener);
    channel.subscribe(statusListener);

    await vi.waitFor(() => {
      expect(statusListener).toHaveBeenCalledWith('SUBSCRIBED');
    });

    // Simulate INSERT
    channel.emitChange('INSERT', { id: 't1', title: 'Buy milk' });
    expect(listener).toHaveBeenCalledWith({
      eventType: 'INSERT',
      new: { id: 't1', title: 'Buy milk' },
      old: {},
    });

    // Simulate UPDATE
    channel.emitChange('UPDATE', { id: 't1', title: 'Buy oat milk' }, { id: 't1', title: 'Buy milk' });
    expect(listener).toHaveBeenCalledWith({
      eventType: 'UPDATE',
      new: { id: 't1', title: 'Buy oat milk' },
      old: { id: 't1', title: 'Buy milk' },
    });

    // Unsubscribe
    channel.unsubscribe();
    channel.emitChange('INSERT', { id: 't2', title: 'Call mechanic' });
    expect(listener).toHaveBeenCalledTimes(2); // Did not receive third event
  });

  it('dispatches each postgres_changes listener only for its configured event', () => {
    const channel = createInMemorySupabaseEmulator().channel('events');
    const inserts = vi.fn();
    const deletes = vi.fn();
    const wildcard = vi.fn();
    channel.on('postgres_changes', { event: 'INSERT' }, inserts);
    channel.on('postgres_changes', { event: 'DELETE' }, deletes);
    channel.on('postgres_changes', { event: 123 }, wildcard);
    channel.on('other_event', { event: '*' }, vi.fn());

    channel.emitChange('INSERT', { id: 1 });
    channel.emitChange('UPDATE', { id: 1 });
    channel.emitChange('DELETE', { id: 1 });

    expect(inserts).toHaveBeenCalledTimes(1);
    expect(deletes).toHaveBeenCalledTimes(1);
    expect(wildcard).toHaveBeenCalledTimes(3);
    expect(channel.getListenerCount()).toBe(3);
  });
});
