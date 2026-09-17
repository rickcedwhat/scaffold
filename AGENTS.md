# AI Playbook & Instructions

This repository is governed by the engineering principles defined in [philosophy.md](./philosophy.md).

## Core Rules for AI
1. Component Boundaries: Never add `className` or `style` props to public component interfaces. Styling is strictly encapsulated. Customization must use semantic design tokens and props.
2. Architecture: TanStack Router for routing, TanStack Query for server state, Vitest and Playwright for tests.
3. Dual-Account Git Flow: The AI account (`rickcedwhat-ai`) pushes only to feature branches and opens PRs. Never push directly to `main`.
4. Quality: Always verify typechecks, lint (npm run lint), tests, and builds before proposing or opening PRs.
5. Peer Review: Address and proactively resolve actionable review comments left by CodeRabbit on open PRs prior to human merge.
