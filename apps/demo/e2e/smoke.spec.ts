import { test, expect } from '@playwright/test';

/**
 * Smoke suite for the Demo app.
 *
 * These are intentionally lightweight — they verify routes render without
 * crashing and key content is visible. Detailed interaction logic lives in
 * the Vitest integration tests.
 */

test.describe('Demo App — Smoke Suite', () => {
  test('landing page renders hero content', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: 'Scaffold Starter' })).toBeVisible();
    await expect(
      page.getByText('The Architectural Foundation for Personal Software')
    ).toBeVisible();
    await expect(page.getByRole('heading', { name: 'TanStack Router' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'TanStack Query' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Component Guardrails' })).toBeVisible();
  });

  test('dashboard overview loads with sidebar and stats', async ({ page }) => {
    await page.goto('/dashboard');

    // Sidebar nav items
    await expect(page.getByRole('button', { name: 'Overview' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Projects' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Settings' })).toBeVisible();

    // Dashboard content
    await expect(page.getByRole('heading', { name: 'Workspace Overview' })).toBeVisible();
    await expect(page.getByText('$128,450')).toBeVisible();
  });

  test('settings page renders form fields', async ({ page }) => {
    await page.goto('/dashboard/settings');

    await expect(page.getByRole('heading', { name: 'Workspace Settings' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Full Name' })).toHaveValue('Alex Developer');
    await expect(page.getByRole('textbox', { name: 'Email Address' })).toHaveValue('alex@example.com');
  });

  test('projects page renders list and filter tabs', async ({ page }) => {
    await page.goto('/dashboard/projects');

    await expect(page.getByRole('heading', { name: 'Projects & Workspaces' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'scaffold-core' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'local-dev-dashboard' })).toBeVisible();

    // Filter to in-progress
    await page.getByRole('button', { name: /in-progress/i }).click();
    await expect(page.getByRole('heading', { name: 'tanstack-router-starter' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'scaffold-core' })).not.toBeVisible();
  });

  test('sidebar navigation links work', async ({ page }) => {
    await page.goto('/dashboard');

    // Navigate to Projects via sidebar
    await page.getByRole('button', { name: 'Projects' }).click();
    await expect(page).toHaveURL(/\/dashboard\/projects/);
    await expect(page.getByRole('heading', { name: 'Projects & Workspaces' })).toBeVisible();

    // Navigate to Settings via sidebar
    await page.getByRole('button', { name: 'Settings' }).click();
    await expect(page).toHaveURL(/\/dashboard\/settings/);
    await expect(page.getByRole('heading', { name: 'Workspace Settings' })).toBeVisible();
  });

  test('no uncaught console errors on any route', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    for (const path of ['/', '/dashboard', '/dashboard/settings', '/dashboard/projects']) {
      await page.goto(path);
    }

    expect(errors).toHaveLength(0);
  });
});
