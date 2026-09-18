# AI Playbook & Instructions

This repository is governed by the engineering principles defined in [philosophy.md](./philosophy.md).

## Core Rules for AI
1. Component Boundaries: Never add `className` or `style` props to public component interfaces. Styling is strictly encapsulated. Customization must use semantic design tokens and props.
2. Architecture: TanStack Router for routing, TanStack Query for server state, Vitest and Playwright for tests.
3. Dual-Account Git Flow: The AI account (`rickcedwhat-ai`) pushes only to feature branches and opens PRs. Never push directly to `main`.
4. Quality: Always verify typechecks, lint (npm run lint), tests, and builds before proposing or opening PRs.
5. Peer Review: Address and proactively resolve actionable review comments left by CodeRabbit on open PRs prior to human merge. Always reply directly to each inline review comment thread on GitHub (using `gh api repos/{owner}/{repo}/pulls/{pr}/comments -F in_reply_to={comment_id} -f body="..."`) referencing the resolving commit. NEVER post replies as top-level PR issue comments (`gh pr comment`), because CodeRabbit only detects and resolves threads when replied to directly within the thread. Inspect active threads via GraphQL (`reviewThreads { nodes { id isResolved comments { ... } } }`) to ensure no thread is missed.

---

# Local Dev Dashboard — Agent Protocol

**Protocol version: 1**

Tool-agnostic (Cursor, Antigravity, Claude Code, Copilot Chat, etc.). Canonical copy lives on the dashboard — **pull it**, don’t rely on pasted prompts staying fresh.

## Session start (required)

```bash
curl -sS http://localhost:4000/api/agent-protocol
```

1. Read `protocol` + `instructions`.
2. Write `instructions` to **`AGENTS.md`** in this project root (optional: also mirror to your editor’s rules file).
3. Use that `protocol` number on every later dashboard POST.

If any dashboard response has `"stale": true`, repeat this pull, update `AGENTS.md`, then retry with the new protocol. Do **not** expect full instructions in the stale POST body — only `protocolUrl` / `message`.

Dashboard: `/Users/cedrick/Documents/Projects/local-dev-dashboard`  
Base URL: `http://localhost:4000`

---

## Register a project

```bash
node "/Users/cedrick/Documents/Projects/local-dev-dashboard/register.mjs" "<Project Name>" "<absolute-directory>" <port>
```

Or:

```bash
curl -sS -X POST http://localhost:4000/api/register \
  -H 'Content-Type: application/json' \
  -d '{"protocol":1,"name":"Project Name","directory":"/absolute/path","port":5180}'
```

Confirm name, directory, and port after registering.

---

## Agent activity (required when working on a PR)

Tell the dashboard when you **start** and **finish** work so the card shows “agent working” and humans don’t interrupt mid-fix.

### Start

```bash
curl -sS -X POST http://localhost:4000/api/agent-activity \
  -H 'Content-Type: application/json' \
  -d '{
    "protocol": 1,
    "phase": "start",
    "directory": "/absolute/path/to/this/project",
    "pr": 129,
    "summary": "Fixing CodeRabbit actionable comments",
    "agent": "cursor"
  }'
```

Use `"agent": "antigravity"` / `"claude-code"` / etc. when relevant. Identify the project with `directory` (preferred), `projectId`, or `repo`.

### Heartbeat (optional)

Send another `phase: "start"` with an updated `summary` during long sessions so activity doesn’t auto-expire (~45 minutes).

### Finish

```bash
curl -sS -X POST http://localhost:4000/api/agent-activity \
  -H 'Content-Type: application/json' \
  -d '{
    "protocol": 1,
    "phase": "finish",
    "directory": "/absolute/path/to/this/project",
    "summary": "CR comments addressed; waiting on CI"
  }'
```

---

## Manual projects.json shape (rare)

```json
{
  "id": "my-project",
  "name": "My Project",
  "directory": "/Users/cedrick/Documents/Projects/my-project",
  "description": "Short description",
  "services": [
    {
      "id": "my-project-dev",
      "name": "Dev Server",
      "command": "npm",
      "args": ["run", "dev", "--", "--port", "5180"],
      "port": 5180,
      "url": "http://localhost:5180"
    }
  ]
}
```

The dashboard hot-reloads `projects.json`.
