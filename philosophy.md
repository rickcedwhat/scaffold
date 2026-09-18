# System Philosophy & Engineering Manifest

## Mission
Build personal software that is fast to launch, rock-solid in production, and unmistakably cohesive. AI accelerates implementation, but human architectural taste governs the foundation. By eliminating low-level styling decisions and standardizing infrastructure, we focus entirely on feature velocity and product quality.

---

## 1. The Component Guardrail Principle

AI tends to invent arbitrary styling—random margins, unexpected hex colors, mismatched shadows, and divergent layout patterns. To maintain visual harmony across projects, components must be strictly bounded.

- Components deliberately strip `className` and `style` from their public interfaces. Consumers cannot inject arbitrary CSS classes or inline style overrides.
- Customization happens exclusively through semantic props like `variant`, `intent`, `size`, and `density`. If an aesthetic tweak is needed, it must be promoted to the design system rather than hacked into a one-off component.
- Layout is governed by structural primitives (`Stack`, `Grid`, `PageShell`, `Card`) with tokenized gap and padding scales, preventing arbitrary layout drift.
- Accessible primitives (such as Radix UI) serve as the underlying headless engine for complex behaviors (dialogs, popovers, dropdowns), wrapped in our design language.
- Empty states, confirmations, and feedback surfaces feature built-in Lottie animations (`EmptyState`, `StatusIllustration`) with cohesive defaults so apps never feel sterile.

---

## 2. Default Stack & Runtime Standards

Every project starts with the same modern, reliable foundation:

- **Framework & Bundler:** React 19, TypeScript, and Vite.
- **Routing:** TanStack Router with type-safe search parameters, route loaders, and nested layouts.
- **Server State:** TanStack Query with standard stale times, retry behaviors, and predictable query key factories.
- **Real-Time Data:** For projects leveraging Firebase or live streams, dedicated real-time hooks (`useLiveDocument`, `useLiveCollection`) cleanly manage listeners without forcing live feeds into awkward query cache sync loops.
- **Forms & Validation:** React Hook Form bound to Zod schemas. Forms derive validation, error handling, and accessibility attributes directly from schema definitions.
- **Icons:** A single, consistent icon pack across all applications.

---

## 3. The Testing Mandate

Quality is never an afterthought. Every feature and workflow must be accompanied by automated validation.

- **Vitest for Unit & Component Tests:** Vitest runs with `jsdom` and `@testing-library/react`. Custom test renderers automatically wrap components in the necessary Query, Router, and Theme providers.
- **Playwright for End-to-End Coverage:** Every repo includes Playwright pre-configured against the Vite dev server. A default smoke suite verifies page boots, critical path routing, responsive layouts, and console hygiene.
- Tests prioritize user behavior and integration points rather than implementation details.

---

## 4. Multi-AI Interoperability

Development moves between Antigravity, Cursor, and Claude Code. No single AI tool's proprietary format may become the sole repository brain.

- This file (`philosophy.md`) is the canonical source of truth for repository principles.
- Tool-specific files (`CLAUDE.md`, `.cursorrules`, `AGENTS.md`) must remain thin pointers or symlinks referencing this core philosophy.
- The TypeScript compiler and ESLint rules act as the ultimate arbiters: if an AI generates unapproved props or untyped overrides, the build fails immediately.

---

## 5. Dual-Account GitHub Workflow

Contributions are partitioned cleanly between automated generation and human oversight:

- An AI service account handles all automated branch creation, implementation commits, and pull requests.
- Every PR opened by the AI account automatically triggers the CI test suite (typecheck, lint, Vitest, Playwright smoke tests) and requests review from the primary account.
- Automated peer review (CodeRabbit) acts as an independent auditor on PRs, pre-checking logic, edge cases, accessibility, and guardrails before human review. Actionable feedback is resolved in follow-up commits, and agents reply to each review thread with commit references so CodeRabbit can verify and confirm resolution.
- Merges to `main` and production deployments are executed strictly by the primary human account.

---

## 6. Modular, Opt-In Integrations

Observability and tooling are available as standardized plugins, but never forced onto small projects:

- **Issue Reporting:** GitHub Issues is the default feedback mechanism. A lightweight in-app modal allows filing issues directly from running apps. Linear is an optional adapter.
- **Error Monitoring & Telemetry:** Sentry and Grafana Faro exist as turnkey providers, toggled via environment flags (`ENABLE_TELEMETRY=true`). If disabled, they compile to zero-overhead no-ops.
- **AI Evals:** Unified client helpers for Claude and Gemini include optional Braintrust logging for projects that require prompt evals and latency tracking.

---

## 7. Database Strategy & Guardrails

We leverage Supabase and Firebase pragmatically according to data needs:

- **Supabase for Relational Data:** Used when SQL and relational tables are required. To handle free-tier sleep policies, projects are registered with a centralized keep-alive pinger. Accounts follow a predictable alias convention (`ccata002+<project>@gmail.com`).
- **Firebase for Rapid NoSQL & Auth:** Used for document-centric storage, simple real-time feeds, or serverless scalability.
- **Render-Storm Circuit Breaker:** Client data wrappers include velocity-tracking throttlers in development. If an unstable component re-render triggers excessive queries or snapshot reads, the circuit breaker halts outbound requests and displays an immediate diagnostic overlay.

---

## 8. Secrets & Machine Environment

Configuration is centralized rather than scattered across web dashboards:

- Global credentials live in a central, secure local vault.
- CLI automation provisions `.env.local` files for new projects and pushes environment variables directly to GitHub Secrets and Vercel environments using their respective CLIs.
- All newly scaffolded projects automatically register their dev port and directory with the local development dashboard.
