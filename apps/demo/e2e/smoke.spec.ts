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

    await expect(page.getByText('Scaffold Starter')).toBeVisible();
    await expect(
      page.getByText('The Architectural Foundation for Personal Software')
    ).toBeVisible();
    await expect(page.getByText('TanStack Router')).toBeVisible();
    await expect(page.getByText('TanStack Query')).toBeVisible();
    await expect(page.getByText('Component Guardrails')).toBeVisible();
  });

  test('dashboard overview loads with sidebar and stats', async ({ page }) => {
    await page.goto('/dashboard');

    // Sidebar nav items
    await expect(page.getByText('Overview')).toBeVisible();
    await expect(page.getByText('Projects')).toBeVisible();
    await expect(page.getByText('Settings')).toBeVisible();

    // Dashboard content
    await expect(page.getByText('Workspace Overview')).toBeVisible();
    await expect(page.getByText('$128,450')).toBeVisible();
  });

  test('settings page renders form fields', async ({ page }) => {
    await page.goto('/dashboard/settings');

    await expect(page.getByText('Workspace Settings')).toBeVisible();
    await expect(page.getByDisplayValue('Alex Developer')).toBeVisible();
    await expect(page.getByDisplayValue('alex@example.com')).toBeVisible();
  });

  test('projects page renders list and filter tabs', async ({ page }) => {
    await page.goto('/dashboard/projects');

    await expect(page.getByText('Projects & Workspaces')).toBeVisible();
    await expect(page.getByText('scaffold-core')).toBeVisible();
    await expect(page.getByText('local-dev-dashboard')).toBeVisible();

    // Filter to in-progress
    await page.getByRole('button', { name: /in-progress/i }).click();
    await expect(page.getByText('tanstack-router-starter')).toBeVisible();
    await expect(page.getByText('scaffold-core')).not.toBeVisible();
  });

  test('sidebar navigation links work', async ({ page }) => {
    await page.goto('/dashboard');

    // Navigate to Projects via sidebar
    await page.getByRole('link', { name: /projects/i }).first().click();
    await expect(page).toHaveURL(/\/dashboard\/projects/);
    await expect(page.getByText('Projects & Workspaces')).toBeVisible();

    // Navigate to Settings via sidebar
    await page.getByRole('link', { name: /settings/i }).first().click();
    await expect(page).toHaveURL(/\/dashboard\/settings/);
    await expect(page.getByText('Workspace Settings')).toBeVisible();
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
