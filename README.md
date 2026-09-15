# scaffold

The unified foundation and architecture kit for personal software projects.

`scaffold` is a hands-on React framework, guardrailed design system, and project generator built to maximize developer velocity while strictly maintaining code quality, aesthetic consistency, and infrastructure standards.

## Core Pillars

- **Guardrailed Design System:** Accessible, robust UI primitives that reject arbitrary `className` and `style` overrides. Built with semantic variant props, structured layout blocks, and integrated Lottie animations.
- **TanStack & React 19:** Standardized routing with TanStack Router, data caching with TanStack Query, and dedicated live listeners for real-time engines.
- **Test-Driven Baseline:** Automated Vitest unit/integration setups and Playwright smoke testing configured out of the box.
- **Circuit Breakers & Guardrails:** Client-side query throttlers that detect and halt runaway re-render loops before they exhaust database free-tier quotas.
- **Opt-In Integrations:** Turnkey adapters for Sentry, Grafana Faro, GitHub Issues / Linear, and Braintrust evals.
- **Multi-AI Interoperability:** Clean separation between human oversight and AI generation with tool-agnostic guidelines.

See [philosophy.md](./philosophy.md) for the complete engineering manifest and architectural rules.
