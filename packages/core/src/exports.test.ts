import { expect, it, vi } from 'vitest';

vi.mock('react-hook-form', () => { throw new Error('Optional form dependency loaded'); });
vi.mock('@hookform/resolvers/zod', () => { throw new Error('Optional form dependency loaded'); });
vi.mock('zod', () => { throw new Error('Optional form dependency loaded'); });

it('loads root APIs without loading optional form dependencies', async () => {
  const core = await import('@scaffold/core');
  expect(core.CircuitBreaker).toBeTypeOf('function');
  expect(core).not.toHaveProperty('useAppForm');
});
