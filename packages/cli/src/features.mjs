/**
 * Opt-in features layered on top of apps/template.
 *
 * `dependencies` lists package names; versions are resolved from the monorepo
 * at generation time so generated apps stay in sync with the packages.
 * `files` maps a template under packages/cli/templates/<feature>/ to a path
 * inside the generated app (overwriting the template's file when present).
 *
 * @typedef {{
 *   description: string;
 *   dependencies: string[];
 *   files: Array<{ from: string; to: string }>;
 * }} Feature
 */

const FORM_PEERS = ['@scaffold/core', 'react-hook-form', 'zod', '@hookform/resolvers'];

/** @type {Record<string, Feature>} */
export const FEATURES = {
  forms: {
    description: 'React Hook Form + Zod settings form via @scaffold/core/form',
    dependencies: FORM_PEERS,
    files: [
      { from: 'forms/settings.tsx.tpl', to: 'src/routes/app/settings.tsx' },
      { from: 'forms/forms.test.tsx.tpl', to: 'src/forms.test.tsx' },
    ],
  },
  feedback: {
    description: 'In-app issue reporting widget via @scaffold/feedback (noop adapter)',
    dependencies: ['@scaffold/feedback', ...FORM_PEERS],
    files: [
      { from: 'feedback/__root.tsx.tpl', to: 'src/routes/__root.tsx' },
      { from: 'feedback/feedback.test.tsx.tpl', to: 'src/feedback.test.tsx' },
    ],
  },
};
