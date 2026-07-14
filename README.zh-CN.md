# myagent

## 项目介绍

`myagent` 是一个基于 TypeScript 和 Node.js 搭建的本地 harness agent 项目。它的学习来源是 [`shareAI-lab/learn-claude-code`](https://github.com/shareAI-lab/learn-claude-code)，重点是理解 Claude Code 风格 Coding Agent 背后的 harness 架构。

这个项目不是简单给模型套一层 prompt。它关注的是 LLM 外围的运行时系统：模型流式通信、工具执行、权限控制、记忆、Skills、MCP 接入、Sub-Agent、任务状态、上下文管理和终端 UI。

> English version: see [README.md](./README.md).

## 这个项目是什么

`myagent` 是一个终端原生的 Coding Agent 运行时。`src/` 下的 TypeScript 应用是主实现，`step/` 目录中保留了从 `shareAI-lab/learn-claude-code` 导入的学习和参考资料。

核心能力包括：

- 基于 React/Ink 的终端 UI
- 支持流式模型输出的多轮 agent loop
- 本地工具：文件读写编辑、搜索、Shell、Web fetch/search、MCP resources、Memory
- `default`、`plan`、`auto` 三种权限模式
- 基于 `.myagent` 的用户级和项目级配置
- 会话历史、上下文压缩、文件历史 checkpoint
- Skills、自定义 slash commands、output styles、hooks、sub-agents、可选 agent teams
- 支持 Anthropic 兼容、OpenAI 兼容、Gemini、本地 OpenAI 兼容端点等模型 Profile

## 架构

```text
+---------------------------------------------------+
| 1. 交互层                                          |
|    终端 UI、输入处理、渲染输出                        |
+---------------------------------------------------+
| 2. 编排层                                          |
|    多轮会话、命令、任务状态                            |
+---------------------------------------------------+
| 3. 核心 Agent Loop                                 |
|    模型 -> 工具调用 -> 观察结果 -> 模型                 |
+---------------------------------------------------+
| 4. 工具层                                          |
|    文件、Shell、搜索、Web、MCP、权限                    |
+---------------------------------------------------+
| 5. 模型通信层                                       |
|    Provider Profile 与流式 LLM I/O                  |
+---------------------------------------------------+
```

## 仓库结构

```text
myagent/
├── src/
│   ├── entrypoint/      # CLI 与 headless 入口
│   ├── ui/              # React/Ink 终端界面
│   ├── core/            # agent loop 与 query orchestration
│   ├── agents/          # 子 Agent 定义、注册表与运行器
│   ├── tools/           # 本地工具与工具注册系统
│   ├── services/        # Provider API、MCP 与 Skills 服务
│   ├── permissions/     # 权限与安全控制
│   ├── context/         # system prompt、memory 与 compaction
│   ├── sandbox/         # Bash sandbox 设置与命令包装
│   ├── session/         # 会话持久化与文件历史
│   ├── commands/        # 内置与用户自定义 slash commands
│   ├── hooks/           # 生命周期 hook 加载与执行
│   ├── state/           # Todo、Task、Agent 等运行时状态
│   ├── types/           # 共享领域类型
│   └── utils/           # env、config、log、path 与辅助函数
├── scripts/             # 独立验证脚本
├── step/                # 学习/参考资料
├── public/              # 静态资源
├── package.json
├── tsconfig.json
├── README.md
├── README.zh-CN.md
└── AGENT.md
```

## 环境要求

- Node.js 22+
- npm
- 至少一种受支持的模型 Provider：
  - Anthropic 兼容 API
  - OpenAI 兼容 API
  - Gemini
  - Ollama 这类本地 OpenAI 兼容端点

## 安装

```bash
npm install
```

## 运行

开发模式：

```bash
npm run dev
```

构建并运行编译后的 CLI：

```bash
npm run build
npm start
```

CLI 示例：

```bash
myagent --help
myagent --model gpt
myagent --plan
myagent --auto
echo "summarize this repo" | myagent --print --output-format json
```

## 模型配置

`myagent` 会读取以下运行时配置：

- 用户配置：`~/.myagent/settings.json`
- 项目配置：`<cwd>/.myagent/settings.json`
- 项目本地覆盖：`<cwd>/.myagent/settings.local.json`

配置示例：

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

常用环境变量：

- `ANTHROPIC_AUTH_TOKEN`
- `ANTHROPIC_BASE_URL`
- `ANTHROPIC_MODEL`
- `OPENAI_API_KEY`
- `GEMINI_API_KEY`
- `WEB_SEARCH_API_KEY`

## 常用命令

构建和类型检查：

```bash
npm run build
npx tsc --noEmit
```

重点验证：

```bash
node dist/scripts/test-branding.js
node dist/scripts/test-stage23.js
node dist/scripts/test-mcp.js
```

其他 npm 脚本：

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
