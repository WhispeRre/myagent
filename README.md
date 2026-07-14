# myagent

## Project Introduction

`myagent` is a local harness agent project built with TypeScript and Node.js. It is inspired by the [`shareAI-lab/learn-claude-code`](https://github.com/shareAI-lab/learn-claude-code) project and focuses on understanding how a Claude Code-style coding agent is assembled around an LLM.

The project is not just a prompt wrapper. Its main purpose is to study and rebuild the harness layer: model streaming, tool execution, permissions, memory, skills, MCP integration, sub-agents, task state, context management, and terminal UI.

> 中文说明见 [README.zh-CN.md](./README.zh-CN.md).

## What This Project Is

`myagent` is a terminal-native coding agent runtime. The TypeScript app under `src/` is the primary implementation, while `step/` contains imported learning/reference material from `shareAI-lab/learn-claude-code`.

Core capabilities include:

- React/Ink terminal UI
- multi-turn agent loop with streaming model output
- local tools for file read/write/edit, search, shell, web fetch/search, MCP resources, and memory
- permission modes: `default`, `plan`, and `auto`
- user and project settings under `.myagent`
- session history, context compaction, and file-history checkpoints
- skills, custom slash commands, output styles, hooks, sub-agents, and optional agent teams
- model profiles for Anthropic-compatible, OpenAI-compatible, Gemini, and local OpenAI-compatible endpoints

## Architecture

```text
+---------------------------------------------------+
| 1. Interaction Layer                              |
|    Terminal UI, input handling, rendering         |
+---------------------------------------------------+
| 2. Orchestration Layer                            |
|    Multi-turn sessions, commands, task state      |
+---------------------------------------------------+
| 3. Core Agent Loop                                |
|    Model -> tool calls -> observations -> model   |
+---------------------------------------------------+
| 4. Tooling Layer                                  |
|    Files, shell, search, web, MCP, permissions    |
+---------------------------------------------------+
| 5. Model Communication Layer                      |
|    Provider profiles and streaming LLM I/O        |
+---------------------------------------------------+
```

## Repository Layout

```text
myagent/
├── src/
│   ├── entrypoint/      # CLI and headless entrypoints
│   ├── ui/              # React/Ink terminal interface
│   ├── core/            # agent loop and query orchestration
│   ├── agents/          # sub-agent definitions, registry, and runners
│   ├── tools/           # local tools and tool registry
│   ├── services/        # provider API, MCP, and skills services
│   ├── permissions/     # permission and safety controls
│   ├── context/         # system prompt, memory, and compaction
│   ├── sandbox/         # Bash sandbox settings and command wrapping
│   ├── session/         # session persistence and file history
│   ├── commands/        # built-in and user-defined slash commands
│   ├── hooks/           # lifecycle hook loading and execution
│   ├── state/           # UI/runtime stores for tasks, todos, agents
│   ├── types/           # shared domain types
│   └── utils/           # env, config, logging, path, and helper utilities
├── scripts/             # standalone verification scripts
├── step/                # learning/reference material
├── public/              # static assets
├── package.json
├── tsconfig.json
├── README.md
├── README.zh-CN.md
└── AGENT.md
```

## Requirements

- Node.js 22+
- npm
- Access to at least one supported model provider:
  - Anthropic-compatible API
  - OpenAI-compatible API
  - Gemini
  - local OpenAI-compatible endpoint such as Ollama

## Install

```bash
npm install
```

## Run

Development mode:

```bash
npm run dev
```

Build and run the compiled CLI:

```bash
npm run build
npm start
```

CLI examples:

```bash
myagent --help
myagent --model gpt
myagent --plan
myagent --auto
echo "summarize this repo" | myagent --print --output-format json
```

## Model Configuration

`myagent` reads runtime settings from:

- user settings: `~/.myagent/settings.json`
- project settings: `<cwd>/.myagent/settings.json`
- local project overrides: `<cwd>/.myagent/settings.local.json`

Example settings:

```json
{
  "defaultModel": "gpt",
  "models": {
    "gpt": {
      "protocol": "openai-chat",
      "model": "gpt-5.1",
      "baseURL": "https://api.openai.com/v1",
      "apiKey": "${OPENAI_API_KEY}"
    },
    "gemini": {
      "protocol": "gemini",
      "model": "gemini-2.5-pro",
      "apiKey": "${GEMINI_API_KEY}"
    },
    "ollama": {
      "protocol": "openai-chat",
      "model": "qwen2.5-coder",
      "baseURL": "http://localhost:11434/v1"
    }
  }
}
```

Common environment variables:

- `ANTHROPIC_AUTH_TOKEN`
- `ANTHROPIC_BASE_URL`
- `ANTHROPIC_MODEL`
- `OPENAI_API_KEY`
- `GEMINI_API_KEY`
- `WEB_SEARCH_API_KEY`

## Useful Commands

Build and type-check:

```bash
npm run build
npx tsc --noEmit
```

Focused verification:

```bash
node dist/scripts/test-branding.js
node dist/scripts/test-stage23.js
node dist/scripts/test-mcp.js
```

Additional npm scripts:

```bash
npm run test:streaming
npm run test:tasks
npm run test:mcp
npm run test:skills
npm run test:sandbox
npm run test:agents
npm run test:filehistory
npm run test:resilience
```
