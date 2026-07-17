# AGENTS.md

## ⚡ MANDATORY: Architecture Frameworks

Before implementing any feature, modifying entities, changing backend functions, or generating code, read and follow these canonical documents:

1. **[`src/EXECLEAD_ENGINEERING_PLAYBOOK.md`](./src/EXECLEAD_ENGINEERING_PLAYBOOK.md)** — Platform Engineering Constitution
   - Architecture governance, engineering principles, quality gates, QA/Product/UX/Security reviews, Executive QA Report™ verdicts

2. **[`src/EXECLEAD_AI_AGENTS_FRAMEWORK.md`](./src/EXECLEAD_AI_AGENTS_FRAMEWORK.md)** — AI Agents & Automation Framework
   - Multi-agent orchestration architecture, Agent Registry™, specialized agents (Executive/Developer/Enterprise), Automation Engine™, Human Approval flow, shared Memory + Event Bus, workspace awareness, AI safety rules

Both are mandatory context for every session. They override any conflicting instruction below.

---

## Project Context

This is a Base44 app repository. Treat it as user-owned application code, keep changes focused on the user's request, and preserve existing project conventions.

Start with `README.md` for local setup, environment variables, and publish workflow.

## Base44 References

- CLI overview: https://docs.base44.com/developers/references/cli/get-started/overview.md
- Agent skills: https://docs.base44.com/developers/backend/overview/skills.md

If your agent supports Agent Skills, install or update Base44 skills before Base44-specific work:

```bash
npx skills add base44/skills
```

## Key Files

- `src/`: frontend application source.
- `src/api/base44Client.js`: frontend Base44 SDK client.
- `vite.config.js`: Vite config and Base44 Vite plugin setup.
- `.env.local`: local-only environment values; never commit secrets.

## Working Notes

- Use `base44 dev` as the default local development command when you need the local Base44 backend. It can run the backend and frontend together.
- When docs or code mention the frontend being started automatically, that usually means the Base44 project config includes `site.serveCommand`, for example `"serveCommand": "npm run dev"` in `base44/config.jsonc`.
- Use `npm run dev` only for frontend-only work against the hosted Base44 backend.
- Prefer the existing Base44 CLI workflow over adding new npm scripts for Base44-specific tasks.
- Reuse the existing SDK client and Vite plugin patterns before adding new Base44 integration paths.
- Run the relevant checks from `package.json` before finishing code changes.