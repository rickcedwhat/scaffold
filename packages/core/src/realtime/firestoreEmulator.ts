import type {
  FirestoreDocRefLike,
  FirestoreDocSnapshotLike,
  FirestoreQueryLike,
  FirestoreQuerySnapshotLike,
} from './types';

export type WhereFilterOp = '==' | '!=' | '<' | '<=' | '>' | '>=' | 'array-contains' | 'in';

export interface QueryConstraint {
  type: 'where' | 'orderBy';
  field: string;
  op?: WhereFilterOp;
  value?: unknown;
  direction?: 'asc' | 'desc';
}

export interface InMemoryFirestoreEmulator {
  doc: <T = any>(pathOrCollection: string | InMemoryCollectionRef<any>, id?: string) => InMemoryDocRef<T>;
  collection: <T = any>(path: string) => InMemoryCollectionRef<T>;
  setDoc: <T = any>(docRef: InMemoryDocRef<T>, data: Record<string, unknown>, options?: { merge?: boolean }) => Promise<void>;
  updateDoc: <T = any>(docRef: InMemoryDocRef<T>, data: Record<string, unknown>) => Promise<void>;
  deleteDoc: (docRef: InMemoryDocRef<any>) => Promise<void>;
  getDoc: <T = any>(docRef: InMemoryDocRef<T>) => Promise<FirestoreDocSnapshotLike<T>>;
  getDocs: <T = any>(query: InMemoryCollectionRef<T> | InMemoryQuery<T>) => Promise<FirestoreQuerySnapshotLike<T>>;
  onSnapshot: {
    <T = any>(docRef: InMemoryDocRef<T>, onNext: (snap: FirestoreDocSnapshotLike<T>) => void, onError?: (err: Error) => void): () => void;
    <T = any>(query: InMemoryCollectionRef<T> | InMemoryQuery<T>, onNext: (snap: FirestoreQuerySnapshotLike<T>) => void, onError?: (err: Error) => void): () => void;
  };
  query: <T = any>(collectionRef: InMemoryCollectionRef<T>, ...constraints: QueryConstraint[]) => InMemoryQuery<T>;
  where: (field: string, op: WhereFilterOp, value: unknown) => QueryConstraint;
  orderBy: (field: string, direction?: 'asc' | 'desc') => QueryConstraint;
  clear: () => void;
}

export interface InMemoryDocRef<T = any> extends FirestoreDocRefLike<T> {
  id: string;
  path: string;
  collectionName: string;
}

export interface InMemoryCollectionRef<T = any> extends FirestoreQueryLike<T> {
  path: string;
  collectionName: string;
}

export interface InMemoryQuery<T = any> extends FirestoreQueryLike<T> {
  collectionRef: InMemoryCollectionRef<T>;
  constraints: QueryConstraint[];
}

/**
 * Creates an in-process, zero-dependency Firestore test emulator.
 *
 * Implements real-time listeners (`onSnapshot`), CRUD (`setDoc`, `updateDoc`, `deleteDoc`),
 * and filtering (`where`, `orderBy`) with zero external processes or Java requirements.
 */
export function createInMemoryFirestoreEmulator(): InMemoryFirestoreEmulator {
  // Storage: collectionName -> (docId -> data)
  const store = new Map<string, Map<string, Record<string, unknown>>>();

  // Active listeners
  type DocListener = (snap: FirestoreDocSnapshotLike) => void;
  type QueryListener = (snap: FirestoreQuerySnapshotLike) => void;

  const docListeners = new Map<string, Set<DocListener>>();
  const queryListeners = new Set<{
    collectionName: string;
    constraints: QueryConstraint[];
    callback: QueryListener;
  }>();

  function getCollectionStore(name: string): Map<string, Record<string, unknown>> {
    let col = store.get(name);
    if (!col) {
      col = new Map();
      store.set(name, col);
    }
    return col;
  }

  function createDocSnapshot(docRef: InMemoryDocRef): FirestoreDocSnapshotLike {
    const col = getCollectionStore(docRef.collectionName);
    const docData = col.get(docRef.id);
    const exists = docData !== undefined;

    return {
      id: docRef.id,
      exists: () => exists,
      data: () => (exists ? { ...docData } : undefined),
      metadata: { fromCache: false, hasPendingWrites: false },
    };
  }

  function matchesConstraints(data: Record<string, unknown>, constraints: QueryConstraint[]): boolean {
    for (const c of constraints) {
      if (c.type === 'where') {
        const val = data[c.field];
        switch (c.op) {
          case '==':
            if (val !== c.value) return false;
            break;
          case '!=':
            if (val === undefined || val === c.value) return false;
            break;
          case '<':
            if (val === undefined || (val as number) >= (c.value as number)) return false;
            break;
          case '<=':
            if (val === undefined || (val as number) > (c.value as number)) return false;
            break;
          case '>':
            if (val === undefined || (val as number) <= (c.value as number)) return false;
            break;
          case '>=':
            if (val === undefined || (val as number) < (c.value as number)) return false;
            break;
          case 'in':
            if (!Array.isArray(c.value) || !c.value.includes(val)) return false;
            break;
          case 'array-contains':
            if (!Array.isArray(val) || !val.includes(c.value)) return false;
            break;
        }
      }
    }
    return true;
  }

  function createQuerySnapshot(
    collectionName: string,
    constraints: QueryConstraint[] = []
  ): FirestoreQuerySnapshotLike {
    const col = getCollectionStore(collectionName);
    const docs: FirestoreDocSnapshotLike[] = [];

    col.forEach((data, id) => {
      if (matchesConstraints(data, constraints)) {
        docs.push({
          id,
          exists: () => true,
          data: () => ({ ...data }),
          metadata: { fromCache: false, hasPendingWrites: false },
        });
      }
    });

    // Apply orderBy if specified
    const orderConstraints = constraints.filter((c) => c.type === 'orderBy');
    if (orderConstraints.length > 0) {
      docs.sort((a, b) => {
        for (const order of orderConstraints) {
          const aVal = a.data()?.[order.field] ?? '';
          const bVal = b.data()?.[order.field] ?? '';
          const direction = order.direction === 'desc' ? -1 : 1;
          if (aVal < bVal) return -1 * direction;
          if (aVal > bVal) return 1 * direction;
        }
        return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
      });
    }

    return {
      docs,
      empty: docs.length === 0,
      size: docs.length,
      metadata: { fromCache: false, hasPendingWrites: false },
    };
  }

  function notifyDoc(docRef: InMemoryDocRef) {
    const listeners = docListeners.get(docRef.path);
    if (listeners && listeners.size > 0) {
      const snap = createDocSnapshot(docRef);
      listeners.forEach((listener) => listener(snap));
    }
    notifyQueries(docRef.collectionName);
  }

  function notifyQueries(collectionName: string) {
    queryListeners.forEach((item) => {
      if (item.collectionName === collectionName) {
        const snap = createQuerySnapshot(collectionName, item.constraints);
        item.callback(snap);
      }
    });
  }

  const doc = (pathOrCollection: string | InMemoryCollectionRef, id?: string): InMemoryDocRef => {
    let fullPath: string;
    let collectionName: string;
    let docId: string;

    if (typeof pathOrCollection === 'string') {
      const parts = pathOrCollection.split('/').filter(Boolean);
      if (parts.length === 1 && id) {
        collectionName = parts[0];
        docId = id;
        fullPath = `${collectionName}/${docId}`;
      } else if (parts.length === 2) {
        collectionName = parts[0];
        docId = parts[1];
        fullPath = `${collectionName}/${docId}`;
      } else {
        throw new Error(`Invalid doc path: ${pathOrCollection}`);
      }
    } else {
      if (!id) throw new Error('Document ID must be provided when passing CollectionRef');
      collectionName = pathOrCollection.collectionName;
      docId = id;
      fullPath = `${collectionName}/${docId}`;
    }

    const docRef: InMemoryDocRef = {
      id: docId,
      path: fullPath,
      collectionName,
      onSnapshot: (onNext: (snap: FirestoreDocSnapshotLike) => void) => {
        let listeners = docListeners.get(fullPath);
        if (!listeners) {
          listeners = new Set();
          docListeners.set(fullPath, listeners);
        }
        listeners.add(onNext);
        // Emit initial snapshot synchronously/microtask
        queueMicrotask(() => {
          if (listeners?.has(onNext)) {
            onNext(createDocSnapshot(docRef));
          }
        });
        return () => {
          listeners?.delete(onNext);
          if (listeners?.size === 0) {
            docListeners.delete(fullPath);
          }
        };
      },
    };

    return docRef;
  };

  const collection = (path: string): InMemoryCollectionRef => {
    const collectionName = path.split('/').filter(Boolean)[0] || path;
    const colRef: InMemoryCollectionRef = {
      path: collectionName,
      collectionName,
      onSnapshot: (onNext: (snap: FirestoreQuerySnapshotLike) => void) => {
        const entry = { collectionName, constraints: [], callback: onNext };
        queryListeners.add(entry);
        queueMicrotask(() => {
          if (queryListeners.has(entry)) {
            onNext(createQuerySnapshot(collectionName, []));
          }
        });
        return () => {
          queryListeners.delete(entry);
        };
      },
    };
    return colRef;
  };

  const setDoc = async (
    docRef: InMemoryDocRef,
    data: Record<string, unknown>,
    options?: { merge?: boolean }
  ): Promise<void> => {
    const col = getCollectionStore(docRef.collectionName);
    if (options?.merge && col.has(docRef.id)) {
      const existing = col.get(docRef.id) || {};
      col.set(docRef.id, { ...existing, ...data });
    } else {
      col.set(docRef.id, { ...data });
    }
    notifyDoc(docRef);
  };

  const updateDoc = async (docRef: InMemoryDocRef, data: Record<string, unknown>): Promise<void> => {
    const col = getCollectionStore(docRef.collectionName);
    if (!col.has(docRef.id)) {
      throw new Error(`Document not found for update: ${docRef.path}`);
    }
    const existing = col.get(docRef.id) || {};
    col.set(docRef.id, { ...existing, ...data });
    notifyDoc(docRef);
  };

  const deleteDoc = async (docRef: InMemoryDocRef): Promise<void> => {
    const col = getCollectionStore(docRef.collectionName);
    col.delete(docRef.id);
    notifyDoc(docRef);
  };

  const getDoc = async (docRef: InMemoryDocRef): Promise<FirestoreDocSnapshotLike> => {
    return createDocSnapshot(docRef);
  };

  const getDocs = async (
    queryOrCol: InMemoryCollectionRef | InMemoryQuery
  ): Promise<FirestoreQuerySnapshotLike> => {
    const collectionName =
      'collectionName' in queryOrCol ? queryOrCol.collectionName : queryOrCol.collectionRef.collectionName;
    const constraints = 'constraints' in queryOrCol ? queryOrCol.constraints : [];
    return createQuerySnapshot(collectionName, constraints);
  };

  const query = (collectionRef: InMemoryCollectionRef, ...constraints: QueryConstraint[]): InMemoryQuery => {
    const q: InMemoryQuery = {
      collectionRef,
      constraints,
      onSnapshot: (onNext: (snap: FirestoreQuerySnapshotLike) => void) => {
        const entry = {
          collectionName: collectionRef.collectionName,
          constraints,
          callback: onNext,
        };
        queryListeners.add(entry);
        queueMicrotask(() => {
          if (queryListeners.has(entry)) {
            onNext(createQuerySnapshot(collectionRef.collectionName, constraints));
          }
        });
        return () => {
          queryListeners.delete(entry);
        };
      },
    };
    return q;
  };

  const where = (field: string, op: WhereFilterOp, value: unknown): QueryConstraint => ({
    type: 'where',
    field,
    op,
    value,
  });

  const orderBy = (field: string, direction: 'asc' | 'desc' = 'asc'): QueryConstraint => ({
    type: 'orderBy',
    field,
    direction,
  });

  const onSnapshot = (
    target: InMemoryDocRef | InMemoryCollectionRef | InMemoryQuery,
    onNext: (snap: unknown) => void,
    onError?: (err: Error) => void
  ): (() => void) => {
    return target.onSnapshot(onNext as never, onError);
  };

  const clear = () => {
    store.clear();
    docListeners.clear();
    queryListeners.clear();
  };

  return {
    doc,
    collection,
    setDoc,
    updateDoc,
    deleteDoc,
    getDoc,
    getDocs,
    onSnapshot: onSnapshot as InMemoryFirestoreEmulator['onSnapshot'],
    query,
    where,
    orderBy,
    clear,
  };
}
