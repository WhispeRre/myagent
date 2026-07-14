/**
 * Single source of truth for every myagent on-disk path.
 *
 * Why this exists:
 *   The `~/.myagent/` directory layout used to be re-derived in 9
 *   different files (taskStore, plans, memdir, session storage, MCP config,
 *   permission settings, AGENT.md loader, stream debug, …). Every refactor
 *   risked typo-ing the directory name (`.myagent` vs `.agent`) or
 *   computing the home dir slightly differently (`os.homedir()` vs
 *   `process.env.HOME || "~"`, the latter producing a literal `~` string
 *   when HOME was unset).
 *
 *   This module centralizes ALL of those paths — both the global
 *   `~/.myagent/...` family AND the per-project `<cwd>/.myagent/...`
 *   family. Callers should NEVER recompute these paths inline; doing so
 *   defeats the purpose and reintroduces the drift this file was created
 *   to prevent.
 *
 * Layout:
 *
 *   Global (per-user, machine-wide):
 *     ~/.myagent/
 *     ├── settings.json         ← user-scope settings (perms, mcpServers, ...)
 *     ├── AGENT.md              ← user-scope memory loaded into system prompt
 *     ├── tasks/                ← Task V2 persisted task graphs (per session)
 *     ├── plans/                ← Plan-mode plan files
 *     ├── projects/             ← per-cwd memory + session JSONL transcripts
 *     └── stream-debug.log      ← opt-in raw SSE log
 *
 *   Project (per-cwd, repo-local):
 *     <cwd>/.myagent/
 *     └── settings.json         ← project-scope overrides (perms, mcpServers)
 *
 * Path resolution rules:
 *   - Global paths use `os.homedir()` exclusively (NOT `process.env.HOME`,
 *     which is unreliable on Windows and can be unset/empty).
 *   - All path joins go through `node:path` so platform separators are
 *     handled correctly.
 *   - These functions are PURE — they don't read or create anything on
 *     disk. Callers that want the directory to exist must `mkdir -p` it
 *     themselves (none of these helpers eagerly mkdir, to keep them
 *     side-effect-free for tests).
 */

import * as os from "node:os";
import * as path from "node:path";

const DIR_NAME = ".myagent";
const SETTINGS_FILE = "settings.json";
const LOCAL_SETTINGS_FILE = "settings.local.json";
const STATE_FILE = "state.json";

// ─── Global (~/.myagent/...) ──────────────────────────────────────

/** Returns `~/.myagent`. */
export function getMyAgentHome(): string {
  return path.join(os.homedir(), DIR_NAME);
}

/** Returns `~/.myagent/<name>` — for any subdirectory or file by name. */
export function getMyAgentPath(...segments: string[]): string {
  return path.join(getMyAgentHome(), ...segments);
}

/** Returns `~/.myagent/settings.json`. */
export function getUserSettingsPath(): string {
  return getMyAgentPath(SETTINGS_FILE);
}

/**
 * Returns `~/.myagent/state.json` — the machine-level State store
 * (project trust + per-machine preferences). Distinct from settings.json:
 * this file is never version-controlled and holds runtime/security state,
 * not shareable configuration.
 */
export function getStatePath(): string {
  return getMyAgentPath(STATE_FILE);
}

/** Returns `~/.myagent/AGENT.md`. */
export function getGlobalAgentMdPath(): string {
  return getMyAgentPath("AGENT.md");
}

/** Returns `~/.myagent/tasks`. */
export function getTasksRoot(): string {
  return getMyAgentPath("tasks");
}

/** Returns `~/.myagent/plans`. */
export function getPlansRoot(): string {
  return getMyAgentPath("plans");
}

/** Returns `~/.myagent/teams` — stage 21 Agent Teams root directory. */
export function getTeamsRoot(): string {
  return getMyAgentPath("teams");
}

/** Returns `~/.myagent/projects` — both memory + session storage live here. */
export function getProjectsRoot(): string {
  return getMyAgentPath("projects");
}

/** Returns `~/.myagent/stream-debug.log`. */
export function getStreamDebugLogPath(): string {
  return getMyAgentPath("stream-debug.log");
}

// ─── Project (<cwd>/.myagent/...) ─────────────────────────────────

/** Returns `<cwd>/.myagent`. */
export function getProjectMyAgentDir(cwd: string): string {
  return path.join(cwd, DIR_NAME);
}

/** Returns `<cwd>/.myagent/settings.json`. */
export function getProjectSettingsPath(cwd: string): string {
  return path.join(getProjectMyAgentDir(cwd), SETTINGS_FILE);
}

/**
 * Returns `<cwd>/.myagent/settings.local.json` — project-local personal
 * overrides. This file is gitignored (the writer adds it to `.gitignore`
 * automatically) so individual preferences never get committed.
 */
export function getLocalSettingsPath(cwd: string): string {
  return path.join(getProjectMyAgentDir(cwd), LOCAL_SETTINGS_FILE);
}

// ─── Tuple helpers ───────────────────────────────────────────────────

/**
 * Returns both settings file paths in scope order (user, then project).
 * Convenient for code that loads + merges both, like the MCP config and
 * permission settings loaders. Project overrides user, so iterate in this
 * order and let later writes win.
 */
export function getSettingsPaths(cwd: string): { user: string; project: string } {
  return { user: getUserSettingsPath(), project: getProjectSettingsPath(cwd) };
}
