import { describe, it, expect, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useLiveDocument } from './useLiveDocument';
import { createInMemoryFirestoreEmulator } from './firestoreEmulator';
import { createQueryClient } from '../query/queryClient';

describe('useLiveDocument', () => {
  it('streams real-time document data from firestore emulator', async () => {
    const emulator = createInMemoryFirestoreEmulator();
    const docRef = emulator.doc('users/alice');

    // Seed document
    await emulator.setDoc(docRef, { name: 'Alice', role: 'admin' });

    const { result } = renderHook(() =>
      useLiveDocument<{ name: string; role: string }>(docRef)
    );

    // Initial loading or immediate microtask
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.status).toBe('success');
    });

    expect(result.current.data).toEqual({ name: 'Alice', role: 'admin' });
    expect(result.current.id).toBe('alice');

    // Real-time update in emulator
    await act(async () => {
      await emulator.updateDoc(docRef, { role: 'superadmin' });
    });

    await waitFor(() => {
      expect(result.current.data?.role).toBe('superadmin');
    });

    // Real-time delete
    await act(async () => {
      await emulator.deleteDoc(docRef);
    });

    await waitFor(() => {
      expect(result.current.data).toBeNull();
    });
  });

  it('respects enabled: false and remains idle', () => {
    const emulator = createInMemoryFirestoreEmulator();
    const docRef = emulator.doc('users/bob');

    const { result } = renderHook(() =>
      useLiveDocument(docRef, { enabled: false })
    );

    expect(result.current.status).toBe('idle');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeNull();
  });

  it('unsubscribes on unmount without leaking listeners', async () => {
    const emulator = createInMemoryFirestoreEmulator();
    const docRef = emulator.doc('users/charlie');
    await emulator.setDoc(docRef, { count: 1 });

    const onData = vi.fn();
    const { unmount } = renderHook(() =>
      useLiveDocument<{ count: number }>(docRef, { onData })
    );

    await waitFor(() => {
      expect(onData).toHaveBeenCalledTimes(1);
    });

    // Unmount hook
    unmount();

    // Trigger update in emulator
    await emulator.updateDoc(docRef, { count: 2 });

    // onData must not be called after unmount
    expect(onData).toHaveBeenCalledTimes(1);
  });

  it('synchronizes real-time updates into TanStack Query cache when queryKey is provided', async () => {
    const queryClient = createQueryClient();
    const emulator = createInMemoryFirestoreEmulator();
    const docRef = emulator.doc('settings/app');
    await emulator.setDoc(docRef, { theme: 'dark' });

    const queryKey = ['settings', 'app'] as const;

    const { result } = renderHook(() =>
      useLiveDocument<{ theme: string }>(docRef, {
        queryKey,
        queryClient,
      })
    );

    await waitFor(() => {
      expect(result.current.data?.theme).toBe('dark');
    });

    // QueryClient cache has been updated!
    expect(queryClient.getQueryData(queryKey)).toEqual({ theme: 'dark' });

    // Update via emulator
    await act(async () => {
      await emulator.updateDoc(docRef, { theme: 'light' });
    });

    await waitFor(() => {
      expect(result.current.data?.theme).toBe('light');
    });

    expect(queryClient.getQueryData(queryKey)).toEqual({ theme: 'light' });
  });

  it('handles custom subscription function targets', async () => {
    let subscriber: ((val: { message: string }) => void) | null = null;
    const customTarget = (onNext: (val: { message: string }) => void) => {
      subscriber = onNext;
      return () => {
        subscriber = null;
      };
    };

    const { result, unmount } = renderHook(() =>
      useLiveDocument<{ message: string }>(customTarget)
    );

    expect(result.current.isLoading).toBe(true);

    act(() => {
      subscriber?.({ message: 'Live stream active' });
    });

    expect(result.current.status).toBe('success');
    expect(result.current.data).toEqual({ message: 'Live stream active' });

    unmount();
    expect(subscriber).toBeNull();
  });
});
