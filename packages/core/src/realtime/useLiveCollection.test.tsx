import { describe, it, expect } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useLiveCollection } from './useLiveCollection';
import { createInMemoryFirestoreEmulator } from './firestoreEmulator';
import { createInMemorySupabaseEmulator } from './supabaseEmulator';
import { createQueryClient } from '../query/queryClient';

describe('useLiveCollection', () => {
  it('streams real-time collection items from firestore emulator', async () => {
    const emulator = createInMemoryFirestoreEmulator();
    const colRef = emulator.collection('tasks');

    await emulator.setDoc(emulator.doc('tasks/t1'), { title: 'First Task', done: false });
    await emulator.setDoc(emulator.doc('tasks/t2'), { title: 'Second Task', done: true });

    const { result } = renderHook(() =>
      useLiveCollection<{ id: string; title: string; done: boolean }>(colRef)
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.status).toBe('success');
      expect(result.current.count).toBe(2);
    });

    expect(result.current.data.map((t) => t.title)).toEqual(['First Task', 'Second Task']);

    // Add another task in real-time
    await act(async () => {
      await emulator.setDoc(emulator.doc('tasks/t3'), { title: 'Third Task', done: false });
    });

    await waitFor(() => {
      expect(result.current.count).toBe(3);
    });

    // Delete a task
    await act(async () => {
      await emulator.deleteDoc(emulator.doc('tasks/t1'));
    });

    await waitFor(() => {
      expect(result.current.count).toBe(2);
      expect(result.current.data.map((t) => t.id)).toEqual(['t2', 't3']);
    });
  });

  it('filters real-time collections using query constraints', async () => {
    const emulator = createInMemoryFirestoreEmulator();
    const colRef = emulator.collection('users');

    await emulator.setDoc(emulator.doc('users/u1'), { name: 'Alice', active: true });
    await emulator.setDoc(emulator.doc('users/u2'), { name: 'Bob', active: false });
    await emulator.setDoc(emulator.doc('users/u3'), { name: 'Charlie', active: true });

    const activeUsersQuery = emulator.query(colRef, emulator.where('active', '==', true));

    const { result } = renderHook(() =>
      useLiveCollection<{ id: string; name: string; active: boolean }>(activeUsersQuery)
    );

    await waitFor(() => {
      expect(result.current.count).toBe(2);
    });

    expect(result.current.data.map((u) => u.name)).toEqual(['Alice', 'Charlie']);
  });

  it('streams changes from Supabase Realtime channel emulator', async () => {
    const supabase = createInMemorySupabaseEmulator();
    const channel = supabase.channel<{ id: string; text: string }>('messages');

    const { result, unmount } = renderHook(() =>
      useLiveCollection<{ id: string; text: string }>(channel, {
        initialData: [{ id: 'm1', text: 'Hello' }],
      })
    );

    await waitFor(() => {
      expect(result.current.status).toBe('success');
    });

    expect(result.current.count).toBe(1);

    // Simulate Supabase Realtime INSERT
    act(() => {
      channel.emitChange('INSERT', { id: 'm2', text: 'World' });
    });

    expect(result.current.count).toBe(2);
    expect(result.current.data.map((m) => m.text)).toEqual(['Hello', 'World']);

    // Simulate Supabase Realtime UPDATE
    act(() => {
      channel.emitChange('UPDATE', { id: 'm1', text: 'Hello World' }, { id: 'm1', text: 'Hello' });
    });

    expect(result.current.count).toBe(2);
    expect(result.current.data[0].text).toBe('Hello World');

    // Simulate Supabase Realtime DELETE
    act(() => {
      channel.emitChange('DELETE', { id: 'm2', text: 'World' }, { id: 'm2', text: 'World' });
    });

    expect(result.current.count).toBe(1);
    expect(result.current.data.map((m) => m.id)).toEqual(['m1']);

    unmount();
    expect(channel.getListenerCount()).toBe(0);
  });

  it('synchronizes live collection into TanStack Query cache when queryKey is provided', async () => {
    const queryClient = createQueryClient();
    const emulator = createInMemoryFirestoreEmulator();
    const colRef = emulator.collection('projects');
    await emulator.setDoc(emulator.doc('projects/p1'), { name: 'Apollo' });

    const queryKey = ['projects', 'list'] as const;

    const { result } = renderHook(() =>
      useLiveCollection<{ id: string; name: string }>(colRef, {
        queryKey,
        queryClient,
      })
    );

    await waitFor(() => {
      expect(result.current.count).toBe(1);
    });

    expect(queryClient.getQueryData(queryKey)).toEqual([{ id: 'p1', name: 'Apollo' }]);

    // Add another project
    await act(async () => {
      await emulator.setDoc(emulator.doc('projects/p2'), { name: 'Gemini' });
    });

    await waitFor(() => {
      expect(result.current.count).toBe(2);
    });

    expect(queryClient.getQueryData(queryKey)).toEqual([
      { id: 'p1', name: 'Apollo' },
      { id: 'p2', name: 'Gemini' },
    ]);
  });
});
