import { useEffect, useRef, useState } from 'react';
import type {
  FirestoreQueryLike,
  FirestoreQuerySnapshotLike,
  LiveCollectionOptions,
  LiveCollectionResult,
  LiveCollectionTarget,
  LiveDataStatus,
  LiveSnapshotMetadata,
  ObservableSubscribable,
  SupabaseChannelLike,
} from './types';

export function useLiveCollection<T = Record<string, unknown>>(
  target: LiveCollectionTarget<T>,
  options: LiveCollectionOptions<T> = {}
): LiveCollectionResult<T> {
  const {
    enabled = true,
    initialData = [],
    queryKey,
    queryClient,
    primaryKey = 'id',
    onData,
    onError,
  } = options;

  const [data, setData] = useState<T[]>(initialData);
  const [status, setStatus] = useState<LiveDataStatus>(() => (enabled && target ? 'loading' : 'idle'));
  const [error, setError] = useState<Error | null>(null);
  const [metadata, setMetadata] = useState<LiveSnapshotMetadata>({});

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

    const handleData = (nextItems: T[], meta: LiveSnapshotMetadata = {}) => {
      setData(nextItems);
      setMetadata(meta);
      setStatus('success');
      setError(null);

      onDataRef.current?.(nextItems);
      if (queryKeyRef.current && queryClientRef.current) {
        queryClientRef.current.setQueryData(queryKeyRef.current, nextItems);
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
      // 2. Firestore Query / CollectionReference
      else if ('onSnapshot' in target && typeof target.onSnapshot === 'function') {
        const firestoreTarget = target as FirestoreQueryLike<T>;
        unsubscribe = firestoreTarget.onSnapshot(
          (snapshot: FirestoreQuerySnapshotLike<T>) => {
            const items = snapshot.docs.map((docSnap) => {
              const docData = docSnap.data();
              if (docData && typeof docData === 'object' && !('id' in (docData as Record<string, unknown>))) {
                return { id: docSnap.id, ...(docData as Record<string, unknown>) } as T;
              }
              return (docData ?? { id: docSnap.id }) as T;
            });
            handleData(items, snapshot.metadata || {});
          },
          handleError
        );
      }
      // 3. Supabase Realtime Channel
      else if ('on' in target && typeof target.on === 'function' && 'subscribe' in target) {
        const channel = target as SupabaseChannelLike<T>;
        let currentItems = [...initialData];

        channel.on('postgres_changes', { event: '*', schema: 'public' }, (payload) => {
          const pk = primaryKey as keyof T;
          if (payload.eventType === 'INSERT') {
            currentItems = [...currentItems, payload.new];
          } else if (payload.eventType === 'UPDATE') {
            currentItems = currentItems.map((item) =>
              item[pk] === payload.new[pk] ? payload.new : item
            );
          } else if (payload.eventType === 'DELETE') {
            currentItems = currentItems.filter((item) => item[pk] !== payload.old[pk]);
          }
          handleData(currentItems);
        });

        channel.subscribe((subStatus, subErr) => {
          if (subErr) {
            handleError(subErr);
          } else if (subStatus === 'SUBSCRIBED') {
            setStatus('success');
          }
        });

        unsubscribe = () => {
          channel.unsubscribe();
        };
      }
      // 4. Observable-like
      else if ('subscribe' in target && typeof (target as ObservableSubscribable<T[]>).subscribe === 'function') {
        const sub = (target as ObservableSubscribable<T[]>).subscribe(handleData, handleError);
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
    status,
    isLoading: status === 'loading',
    isSuccess: status === 'success',
    isError: status === 'error',
    error,
    metadata,
    count: data.length,
  };
}
