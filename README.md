# Codebase Onboarding Agent

Interactive agent to help engineers ramp quickly: it scans architecture, explains design, traces data flow, runs small examples, tracks what you learned, and auto-generates onboarding docs.

## Vision
"Vibe coding" assistant that feels like a senior engineer pair-programming with you:
- Progressive disclosure: start with high-level architecture, drill down on demand.
- Memory of what you've explored and where confusion occurred.
- Generate personalized onboarding summary PDF/Markdown after a session.
- Replay mode: shows the path you took and suggests next areas.

## Stack (Initial Assumptions)
| Layer | Choice | Notes |
|-------|--------|-------|
| Language | TypeScript (Node.js) | Good ecosystem for AST + CLI. |
| AST Parsing | ts-morph | Rich wrapper over TypeScript compiler API. |
| GitHub API | @octokit/rest | Fetch commits, PR diffs for historical context. |
| LLM Provider | Anthropics `anthropic` pkg | For explanation & doc generation. |
| Memory | In-memory + future persistent (SQLite/vector) | Start simple. |
| Sandbox | Placeholder (Noop) | Later: secure VM2/Firecracker isolation. |
| Terminal UI | inquirer + chalk + ora | Interactive menus & styling. |
| Orchestration | Custom Orchestrator class | Coordinates scan, memory, prompts. |

> "Agentuity" referenced in ideation is presently treated as a conceptual orchestration layer. If it refers to a specific platform, integrate later once clarified.

## High-Level Architecture
```
+-------------------+       +------------------+       +--------------------+
| Terminal UI       | <---- | Orchestrator     | ----> | Memory Store       |
+---------+---------+       +---------+--------+       +---------+----------+
          |                           |                          |
          v                           v                          |
   +------+----------------+   +------+----------------+         |
   | Architecture Scanner  |   | GitHub Client         |         |
   +-----------+-----------+   +-----------+-----------+         |
               |                           |                     |
               v                           v                     v
        Source Files (AST)           Commit History        Learning Events
```

## Feature Roadmap
1. Core scanning (files, imports, modules) ✅ (initial stub)
2. Data flow tracing (function call graph)
3. Historical context (evolution of key files via git)
4. LLM explanations ("Explain module X", "Why was pattern Y used?")
5. Personalized onboarding doc generation
6. Secure code execution examples (safe sandbox)
7. Persistence (save session, resume later)
8. Multi-language support (Python/Go/Java via pluggable scanners)
9. Vector semantic search over code & memory

## Usage (After Build)
```powershell
# Install deps
npm install
# Run static scan
npm run dev -- scan --root .
# Launch interactive mode
npm run dev -- interactive --root .
# AI summary (JSON output; uses fallback if no key)
npm run dev -- ai-scan --root . --model claude-3-opus-20240229
```

## Design Choices
- Keep first pass read-only (no mutations to repo) for safety.
- Use ts-morph for structural clarity rather than regex parsing.
- Memory focuses on confusion hotspots to prioritize later explanations.
- Separation of concerns: scanner pure; orchestrator stateful.

## Safety & Privacy Considerations
- Do not send proprietary code verbatim to LLM; summarize first.
- Allow configurable redaction patterns.
- Future: offline embedding model fallback.
 - Current AI summary uses only aggregated metadata (module counts, entrypoints, truncated dependency stats).

## Environment configuration (.env)

Create a `.env` file (we included `.env.example`):

```
ANTHROPIC_API_KEY=sk-your-key-here
ANTHROPIC_MODEL=claude-3-opus-20240229

# Or use OpenRouter instead of direct Anthropic:
LLM_PROVIDER=openrouter
OPENROUTER_API_KEY=sk-or-...
OPENROUTER_MODEL=anthropic/claude-3-opus:latest
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1/chat/completions
```

The CLI loads `.env` automatically. You can still override `--model` on the command line.
When `LLM_PROVIDER=openrouter` (or when `OPENROUTER_API_KEY` is present), the AI summary uses OpenRouter; otherwise it uses Anthropic if `ANTHROPIC_API_KEY` is present; else it falls back to a local summary.

## Contributing Next
- Add a `GitHistoryAnalyzer` to build change timelines.
- Implement a `CallGraphBuilder` for data flow.
- Introduce persistence layer (SQLite) behind MemoryStore interface.
- Add tests for edge cases (cyclic imports, missing tsconfig).
 - Add redaction config for AI prompts.
 - Support multiple providers (OpenAI, local models) via interface.

## License
TBD
