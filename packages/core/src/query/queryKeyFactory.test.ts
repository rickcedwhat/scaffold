import { describe, it, expect } from 'vitest';
import { createQueryKeyFactory } from './queryKeyFactory';

describe('createQueryKeyFactory', () => {
  it('generates predictable base query keys', () => {
    const userKeys = createQueryKeyFactory('users');

    expect(userKeys.all).toEqual(['users']);
    expect(userKeys.lists()).toEqual(['users', 'list']);
    expect(userKeys.list({ role: 'admin' })).toEqual([
      'users',
      'list',
      { filters: { role: 'admin' } },
    ]);
    expect(userKeys.details()).toEqual(['users', 'detail']);
    expect(userKeys.detail('user-42')).toEqual(['users', 'detail', 'user-42']);
    expect(userKeys.detail(101)).toEqual(['users', 'detail', 101]);
  });

  it('supports custom key definitions with closure helpers', () => {
    const projectKeys = createQueryKeyFactory('projects', ({ all, detail }) => ({
      memberList: (projectId: string, role?: string) =>
        [...detail(projectId), 'members', { role }] as const,
      auditLog: (projectId: string) => [...all, 'audit', projectId] as const,
    }));

    expect(projectKeys.all).toEqual(['projects']);
    expect(projectKeys.memberList('proj-1', 'viewer')).toEqual([
      'projects',
      'detail',
      'proj-1',
      'members',
      { role: 'viewer' },
    ]);
    expect(projectKeys.auditLog('proj-1')).toEqual(['projects', 'audit', 'proj-1']);
  });
});
