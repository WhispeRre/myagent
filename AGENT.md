# AGENT.md

This file provides guidance to AI agents when working with code in this repository.

## Project Identity

This repository is documented as **myagent**: a personal TypeScript/Node.js harness agent project built while studying the `shareAI-lab/learn-claude-code` material.

Some implementation identifiers may still need follow-up rename work:

- package metadata
- CLI binary name
- user/project runtime config paths
- system prompt identity
- terminal welcome logo

Do not silently perform a global rename unless the user explicitly asks for that migration.

## Stack

- Runtime: Node.js 22+, ESM, strict TypeScript, target ES2022, JSX `react-jsx`
- UI: React 19 + Ink 7 terminal interface
- Package manager: npm; `package-lock.json` is canonical
- Single-package repository; no monorepo tooling

## High-Level Architecture

The important implementation lives under `src/`:

- `src/entrypoint/` starts the interactive CLI and headless print mode.
- `src/ui/` renders the terminal app with React/Ink.
- `src/core/` owns the multi-turn query engine and agent loop.
- `src/tools/` defines local tools for files, shell, search, web, MCP resources, memory, tasks, and edits.
- `src/services/` contains provider API, MCP, and skills loading.
- `src/permissions/` and `src/sandbox/` guard tool execution.
- `src/context/` assembles the system prompt, memory, and compaction context.
- `src/session/` persists transcripts and file-history snapshots.
- `src/agents/` implements sub-agents and optional agent-team behavior.
- `src/commands/`, `src/styles/`, and `src/hooks/` implement extension surfaces.

`step/` is imported `shareAI-lab/learn-claude-code` learning/reference material. It is useful context, but it is not the primary TypeScript app.

## Commands

There is currently no single `npm test` command.

Common commands:

- Build: `npm run build`
- Type-check without emitting files: `npx tsc --noEmit`
- Run in development mode: `npm run dev`
- Run compiled output: `npm start`

Useful focused checks:

- `npm run test:streaming`
- `npm run test:tasks`
- `npm run test:mcp`
- `npm run test:skills`
- `npm run test:sandbox`
- `npm run test:agents`
- `npm run test:filehistory`
- `npm run test:resilience`

Stage-style smoke scripts currently include:

- `npm run test:stage30`
- `npm run test:stage31`
- `npm run test:stage32`
- `npm run test:stage33`

## Runtime Configuration

The intended `myagent` runtime config paths are:

- User settings: `~/.myagent/settings.json`
- Project settings: `<cwd>/.myagent/settings.json`
- Local project overrides: `<cwd>/.myagent/settings.local.json`

Common model env vars:

- `ANTHROPIC_AUTH_TOKEN`
- `ANTHROPIC_BASE_URL`
- `ANTHROPIC_MODEL`
- `OPENAI_API_KEY`
- `GEMINI_API_KEY`
- `WEB_SEARCH_API_KEY`

## Repository Notes

- `.gitignore` ignores generated dependencies/build output and local runtime config.
- Do not treat `dist/` as source of truth; rebuild it with `npm run build` if needed.
- Do not assume this checkout is a git repository. Check before using git-dependent workflows.
- The docs now use `myagent` as the project name; code-level identity cleanup is intentionally separate.

## Safe Editing Guidance

- Prefer small, focused edits that follow the existing TypeScript style.
- Use existing helpers for paths, settings, permissions, tools, and provider profiles instead of re-deriving behavior inline.
- If changing runtime naming such as `.myagent`, update path helpers, docs, CLI help, tests/goldens, and migration notes together.
- If changing model behavior, verify at least type-checking and the most relevant focused script.
