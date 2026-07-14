import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildSystemPrompt, renderSystemPrompt } from "../context/systemPrompt.js";
import {
  getProjectMyAgentDir,
  getUserSettingsPath,
} from "../utils/paths.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

function expect(label: string, condition: boolean, details = ""): void {
  if (!condition) {
    throw new Error(`${label}${details ? `: ${details}` : ""}`);
  }
}

function read(rel: string): string {
  return fs.readFileSync(path.join(root, rel), "utf8");
}

async function main(): Promise<void> {
  const fakeHome = fs.mkdtempSync(path.join(os.tmpdir(), "myagent-branding-home-"));
  const fakeCwd = fs.mkdtempSync(path.join(os.tmpdir(), "myagent-branding-cwd-"));
  process.env.HOME = fakeHome;

  const pkg = JSON.parse(read("package.json")) as {
    name?: string;
    bin?: Record<string, string>;
  };

  expect("package name is myagent", pkg.name === "myagent", `got ${pkg.name}`);
  expect("CLI binary is myagent", Boolean(pkg.bin?.myagent), `got ${JSON.stringify(pkg.bin)}`);

  expect("user settings path uses .myagent", getUserSettingsPath().includes(`${path.sep}.myagent${path.sep}`), getUserSettingsPath());
  expect(
    "project config dir uses .myagent",
    getProjectMyAgentDir(root).endsWith(`${path.sep}.myagent`),
    getProjectMyAgentDir(root),
  );

  const systemPrompt = renderSystemPrompt(await buildSystemPrompt({ cwd: fakeCwd }));
  expect("system prompt identifies myagent", systemPrompt.includes("You are myagent"));
  const forbidden = ["Easy " + "Agent", "easy" + "-agent", ".easy" + "-agent"];
  for (const name of forbidden) {
    expect(`system prompt does not mention ${name}`, !systemPrompt.includes(name));
  }

  for (const rel of ["README.md", "README.zh-CN.md", "AGENT.md"]) {
    const text = read(rel);
    for (const name of forbidden) {
      expect(`${rel} does not mention ${name}`, !text.includes(name));
    }
  }

  console.log("branding checks passed");
}

main().catch((error) => {
  console.error((error as Error).message);
  process.exit(1);
});
