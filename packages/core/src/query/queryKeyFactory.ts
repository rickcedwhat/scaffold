/**
 * Standard base query key structure for any entity domain.
 */
export interface BaseQueryKeys<TScope extends string> {
  all: readonly [TScope];
  lists: () => readonly [TScope, 'list'];
  list: <TFilter = unknown>(filters?: TFilter) => readonly [TScope, 'list', { filters: TFilter | undefined }];
  details: () => readonly [TScope, 'detail'];
  detail: (id: string | number) => readonly [TScope, 'detail', string | number];
}

export type CustomKeyDefinitions = Record<string, (...args: never[]) => readonly unknown[]>;

export type QueryKeyFactory<
  TScope extends string,
  TCustom extends CustomKeyDefinitions = CustomKeyDefinitions
> = BaseQueryKeys<TScope> & TCustom;

/**
 * Creates a standardized, type-safe query key factory for an entity domain.
 *
 * Enforces predictable key hierarchies:
 * - `keys.all` -> `['users']`
 * - `keys.lists()` -> `['users', 'list']`
 * - `keys.list(filters)` -> `['users', 'list', { filters }]`
 * - `keys.details()` -> `['users', 'detail']`
 * - `keys.detail(id)` -> `['users', 'detail', id]`
 *
 * Custom keys can be defined via the optional builder function:
 * ```ts
 * const userKeys = createQueryKeyFactory('users', ({ all }) => ({
 *   settings: (id: string) => [...all, 'settings', id] as const,
 * }));
 * ```
 */
export function createQueryKeyFactory<
  TScope extends string,
  TCustom extends CustomKeyDefinitions = Record<string, never>
>(
  scope: TScope,
  customDefinitions?: (helpers: {
    scope: TScope;
    all: readonly [TScope];
    lists: () => readonly [TScope, 'list'];
    list: <TFilter = unknown>(filters?: TFilter) => readonly [TScope, 'list', { filters: TFilter | undefined }];
    details: () => readonly [TScope, 'detail'];
    detail: (id: string | number) => readonly [TScope, 'detail', string | number];
  }) => TCustom
): QueryKeyFactory<TScope, TCustom> {
  const all = [scope] as const;
  const lists = () => [scope, 'list'] as const;
  const list = <TFilter = unknown>(filters?: TFilter) =>
    [scope, 'list', { filters }] as const;
  const details = () => [scope, 'detail'] as const;
  const detail = (id: string | number) => [scope, 'detail', id] as const;

  const base: BaseQueryKeys<TScope> = {
    all,
    lists,
    list,
    details,
    detail,
  };

  const custom = customDefinitions
    ? customDefinitions({ scope, all, lists, list, details, detail })
    : ({} as TCustom);

  for (const key of ['all', 'lists', 'list', 'details', 'detail']) {
    if (Object.prototype.hasOwnProperty.call(custom, key)) {
      throw new Error(`Custom query key definition cannot replace reserved key "${key}"`);
    }
  }

  return Object.assign(base, custom) as QueryKeyFactory<TScope, TCustom>;
}
