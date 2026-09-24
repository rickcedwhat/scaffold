import { useEffect, useRef, useState } from 'react';
import type {
  FirestoreDocRefLike,
  FirestoreDocSnapshotLike,
  LiveDocumentOptions,
  LiveDocumentResult,
  LiveDocumentTarget,
  LiveDataStatus,
  LiveSnapshotMetadata,
  ObservableSubscribable,
} from './types';

export function useLiveDocument<T = Record<string, unknown>>(
  target: LiveDocumentTarget<T>,
  options: LiveDocumentOptions<T> = {}
): LiveDocumentResult<T> {
  const {
    enabled = true,
    initialData = null,
    queryKey,
    queryClient,
    onData,
    onError,
  } = options;

  const [data, setData] = useState<T | null>(initialData);
  const [docId, setDocId] = useState<string | null>(() => {
    if (target && typeof target === 'object' && 'id' in target && typeof target.id === 'string') {
      return target.id;
    }
    return null;
  });
  const [status, setStatus] = useState<LiveDataStatus>(() => (enabled && target ? 'loading' : 'idle'));
  const [error, setError] = useState<Error | null>(null);
  const [metadata, setMetadata] = useState<LiveSnapshotMetadata>({});

  // Stable callback refs to prevent unnecessary re-subscribing
  const onDataRef = useRef(onData);
  const onErrorRef = useRef(onError);
  const queryKeyRef = useRef(queryKey);
  const queryClientRef = useRef(queryClient);

  useEffect(() => {
    onDataRef.current = onData;
    onErrorRef.current = onError;
    queryKeyRef.current = queryKey;
    queryClientRef.current = queryClient;
  });

  useEffect(() => {
    if (!enabled || !target) {
      setStatus('idle');
      return;
    }

    setStatus('loading');
    setError(null);

    const handleData = (nextData: T | null, meta: LiveSnapshotMetadata = {}, id?: string) => {
      setData(nextData);
      setMetadata(meta);
      if (id) setDocId(id);
      setStatus('success');
      setError(null);

      if (nextData !== null) {
        onDataRef.current?.(nextData);
        if (queryKeyRef.current && queryClientRef.current) {
          queryClientRef.current.setQueryData(queryKeyRef.current, nextData);
        }
      }
    };

    const handleError = (err: unknown) => {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      setError(errorObj);
      setStatus('error');
      onErrorRef.current?.(errorObj);
    };

    let unsubscribe: (() => void) | undefined;

    try {
      // 1. Function subscribable
      if (typeof target === 'function') {
        unsubscribe = target(handleData, handleError);
      }
      // 2. Firestore DocumentReference-like
      else if ('onSnapshot' in target && typeof target.onSnapshot === 'function') {
        const firestoreTarget = target as FirestoreDocRefLike<T>;
        if (firestoreTarget.id) setDocId(firestoreTarget.id);

        unsubscribe = firestoreTarget.onSnapshot(
          (snapshot: FirestoreDocSnapshotLike<T>) => {
            const exists =
              typeof snapshot.exists === 'function' ? snapshot.exists() : snapshot.exists !== false;

            if (!exists) {
              handleData(null, snapshot.metadata || {}, snapshot.id);
            } else {
              const rawData = snapshot.data();
              handleData((rawData ?? null) as T | null, snapshot.metadata || {}, snapshot.id);
            }
          },
          handleError
        );
      }
      // 3. Observable-like
      else if ('subscribe' in target && typeof (target as ObservableSubscribable<T>).subscribe === 'function') {
        const sub = (target as ObservableSubscribable<T>).subscribe(handleData, handleError);
        unsubscribe = typeof sub === 'function' ? sub : () => sub.unsubscribe();
      }
    } catch (err) {
      handleError(err);
    }

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [target, enabled]);

  return {
    data,
    id: docId,
    status,
    isLoading: status === 'loading',
    isSuccess: status === 'success',
    isError: status === 'error',
    error,
    metadata,
  };
}
