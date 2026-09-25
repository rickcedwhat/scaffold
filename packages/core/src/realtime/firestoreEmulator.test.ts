import { describe, it, expect, vi } from 'vitest';
import { createInMemoryFirestoreEmulator } from './firestoreEmulator';

describe('createInMemoryFirestoreEmulator', () => {
  it('handles doc CRUD operations and snapshots', async () => {
    const emulator = createInMemoryFirestoreEmulator();
    const userRef = emulator.doc('users/alice');

    // 1. Initial get before creation
    const initialSnap = await emulator.getDoc(userRef);
    expect(initialSnap.exists()).toBe(false);
    expect(initialSnap.data()).toBeUndefined();

    // 2. Set document
    await emulator.setDoc(userRef, { name: 'Alice', score: 100 });
    const snap1 = await emulator.getDoc(userRef);
    expect(snap1.exists()).toBe(true);
    expect(snap1.data()).toEqual({ name: 'Alice', score: 100 });

    // 3. Update document
    await emulator.updateDoc(userRef, { score: 120 });
    const snap2 = await emulator.getDoc(userRef);
    expect(snap2.data()).toEqual({ name: 'Alice', score: 120 });

    // 4. Delete document
    await emulator.deleteDoc(userRef);
    const snap3 = await emulator.getDoc(userRef);
    expect(snap3.exists()).toBe(false);
  });

  it('notifies doc onSnapshot listeners in real-time', async () => {
    const emulator = createInMemoryFirestoreEmulator();
    const userRef = emulator.doc('users', 'bob');

    const listener = vi.fn();
    const unsubscribe = emulator.onSnapshot(userRef, listener);

    // Allow initial snapshot microtask
    await vi.waitFor(() => {
      expect(listener).toHaveBeenCalledTimes(1);
    });
    expect(listener.mock.calls[0][0].exists()).toBe(false);

    // Create document
    await emulator.setDoc(userRef, { name: 'Bob', age: 30 });
    expect(listener).toHaveBeenCalledTimes(2);
    expect(listener.mock.calls[1][0].data()).toEqual({ name: 'Bob', age: 30 });

    // Update document
    await emulator.updateDoc(userRef, { age: 31 });
    expect(listener).toHaveBeenCalledTimes(3);
    expect(listener.mock.calls[2][0].data()?.age).toBe(31);

    // Unsubscribe
    unsubscribe();
    await emulator.updateDoc(userRef, { age: 32 });
    expect(listener).toHaveBeenCalledTimes(3); // Did not fire after unmount
  });

  it('filters collection queries with where constraints in real-time', async () => {
    const emulator = createInMemoryFirestoreEmulator();
    const itemsCol = emulator.collection('products');

    await emulator.setDoc(emulator.doc('products/p1'), { name: 'Apples', category: 'fruit', price: 2 });
    await emulator.setDoc(emulator.doc('products/p2'), { name: 'Carrots', category: 'vegetable', price: 1 });
    await emulator.setDoc(emulator.doc('products/p3'), { name: 'Bananas', category: 'fruit', price: 3 });

    // Query fruit
    const fruitQuery = emulator.query(itemsCol, emulator.where('category', '==', 'fruit'));
    const fruitListener = vi.fn();
    const unsub = emulator.onSnapshot(fruitQuery, fruitListener);

    await vi.waitFor(() => {
      expect(fruitListener).toHaveBeenCalled();
    });

    const initialResult = fruitListener.mock.calls[0][0];
    expect(initialResult.size).toBe(2);
    const names = initialResult.docs.map((d: any) => d.data().name);
    expect(names).toEqual(['Apples', 'Bananas']);

    // Add another fruit
    await emulator.setDoc(emulator.doc('products/p4'), { name: 'Oranges', category: 'fruit', price: 4 });
    expect(fruitListener).toHaveBeenCalledTimes(2);
    expect(fruitListener.mock.calls[1][0].size).toBe(3);

    // Add a non-fruit (vegetable) - fruit query should still only have 3 items
    await emulator.setDoc(emulator.doc('products/p5'), { name: 'Broccoli', category: 'vegetable', price: 2 });
    expect(fruitListener.mock.calls[fruitListener.mock.calls.length - 1][0].size).toBe(3);

    unsub();
  });

  it('excludes missing fields from inequality and range filters', async () => {
    const emulator = createInMemoryFirestoreEmulator();
    const collection = emulator.collection('scores');
    await emulator.setDoc(emulator.doc('scores/missing'), { name: 'Missing' });
    await emulator.setDoc(emulator.doc('scores/low'), { score: 1 });
    await emulator.setDoc(emulator.doc('scores/high'), { score: 3 });

    for (const [op, value, expected] of [
      ['!=', 1, ['high']],
      ['<', 2, ['low']],
      ['<=', 1, ['low']],
      ['>', 2, ['high']],
      ['>=', 3, ['high']],
    ] as const) {
      const result = await emulator.getDocs(emulator.query(collection, emulator.where('score', op, value)));
      expect(result.docs.map((doc) => doc.id)).toEqual(expected);
    }

    expect((await emulator.getDocs(emulator.query(collection, emulator.where('score', '==', undefined)))).docs.map((doc) => doc.id)).toEqual(['missing']);
    expect((await emulator.getDocs(emulator.query(collection, emulator.where('score', 'in', [undefined])))).docs.map((doc) => doc.id)).toEqual(['missing']);
  });

  it('uses orderBy constraints in declaration order and document ID to break ties', async () => {
    const emulator = createInMemoryFirestoreEmulator();
    const collection = emulator.collection('rankings');
    await emulator.setDoc(emulator.doc('rankings/z'), { group: 1, score: 2 });
    await emulator.setDoc(emulator.doc('rankings/c'), { group: 2, score: 9 });
    await emulator.setDoc(emulator.doc('rankings/b'), { group: 1, score: 2 });
    await emulator.setDoc(emulator.doc('rankings/a'), { group: 1, score: 5 });

    const result = await emulator.getDocs(emulator.query(
      collection,
      emulator.orderBy('group'),
      emulator.orderBy('score', 'desc')
    ));
    expect(result.docs.map((doc) => doc.id)).toEqual(['a', 'b', 'z', 'c']);
  });
});
