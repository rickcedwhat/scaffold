import type { QueryClient } from '@tanstack/react-query';

export interface LiveSnapshotMetadata {
  fromCache?: boolean;
  hasPendingWrites?: boolean;
}

/**
 * Standard snapshot format from Firestore DocumentSnapshot duck-typing.
 */
export interface FirestoreDocSnapshotLike<T = any> {
  id: string;
  exists: () => boolean;
  data: () => T | undefined;
  metadata?: LiveSnapshotMetadata;
}

/**
 * Standard snapshot format from Firestore QuerySnapshot duck-typing.
 */
export interface FirestoreQuerySnapshotLike<T = any> {
  docs: Array<FirestoreDocSnapshotLike<T>>;
  empty?: boolean;
  size?: number;
  metadata?: LiveSnapshotMetadata;
}

/**
 * Duck-typed Firestore DocumentReference or object with an onSnapshot listener.
 */
export interface FirestoreDocRefLike<T = any> {
  id?: string;
  path?: string;
  onSnapshot: (
    onNext: (snapshot: FirestoreDocSnapshotLike<T>) => void,
    onError?: (error: Error) => void
  ) => () => void;
}

/**
 * Duck-typed Firestore Query / CollectionReference with an onSnapshot listener.
 */
export interface FirestoreQueryLike<T = any> {
  path?: string;
  onSnapshot: (
    onNext: (snapshot: FirestoreQuerySnapshotLike<T>) => void,
    onError?: (error: Error) => void
  ) => () => void;
}

/**
 * Generic subscription provider (e.g. RxJS, custom WebSockets).
 */
export interface ObservableSubscribable<T> {
  subscribe: (
    onNext: (value: T) => void,
    onError?: (error: Error) => void
  ) => (() => void) | { unsubscribe: () => void };
}

/**
 * Function subscription provider.
 */
export type FunctionSubscribable<T> = (
  onNext: (value: T) => void,
  onError?: (error: Error) => void
) => () => void;

/**
 * Supabase Realtime Channel-like duck-typing.
 */
export interface SupabaseChannelLike<T = unknown> {
  on: (
    event: string,
    filter: Record<string, unknown>,
    callback: (payload: { new: T; old: T; eventType: string }) => void
  ) => SupabaseChannelLike<T>;
  subscribe: (statusCallback?: (status: string, err?: Error) => void) => SupabaseChannelLike<T>;
  unsubscribe: () => Promise<unknown> | void;
}

export type LiveDocumentTarget<T> =
  | FirestoreDocRefLike<T>
  | ObservableSubscribable<T>
  | FunctionSubscribable<T>
  | null
  | undefined;

export type LiveCollectionTarget<T> =
  | FirestoreQueryLike<T>
  | ObservableSubscribable<T[]>
  | FunctionSubscribable<T[]>
  | SupabaseChannelLike<T>
  | null
  | undefined;

export type LiveDataStatus = 'idle' | 'loading' | 'success' | 'error';

export interface BaseLiveOptions<TData> {
  /**
   * If false, suspends listener creation and enters 'idle' state.
   * Default: true
   */
  enabled?: boolean;
  /**
   * Optional TanStack Query key to synchronize with QueryClient cache on each update.
   */
  queryKey?: readonly unknown[];
  /**
   * Optional custom QueryClient to receive cache updates (defaults to global default or hook context).
   */
  queryClient?: QueryClient;
  /**
   * Callback fired on each real-time update.
   */
  onData?: (data: TData) => void;
  /**
   * Callback fired when a subscription error occurs.
   */
  onError?: (error: Error) => void;
}

export interface LiveDocumentOptions<T> extends BaseLiveOptions<T> {
  initialData?: T | null;
}

export interface LiveCollectionOptions<T> extends BaseLiveOptions<T[]> {
  initialData?: T[];
  /**
   * For Supabase channel targets: primary key field name (default: 'id') to merge changes.
   */
  primaryKey?: string;
}

export interface LiveDocumentResult<T> {
  data: T | null;
  id: string | null;
  status: LiveDataStatus;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: Error | null;
  metadata: LiveSnapshotMetadata;
}

export interface LiveCollectionResult<T> {
  data: T[];
  status: LiveDataStatus;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: Error | null;
  metadata: LiveSnapshotMetadata;
  count: number;
}
