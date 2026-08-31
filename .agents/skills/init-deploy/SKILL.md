---
name: init-deploy
description: Prepare and release this template fork through Railway, Vercel, and GitHub integration, including PostgreSQL, backend and frontend projects, custom domains, pull-request previews, and production verification. Use for deployment setup or deployment-readiness audits of this repository.
---

# Init Deploy

Read [references/deployment-checklist.md](references/deployment-checklist.md) before planning or changing provider state. Use it as the repository-specific release contract.

## Inputs

Discover these from the repository and provider accounts when possible; otherwise ask for the missing values together:

- GitHub `owner/repository` and production branch
- Railway workspace/project target
- Vercel team target
- production API, SPA, and SSR hostnames
- the shared cookie domain implied by those hostnames

Google OAuth credentials and authentication secrets must be entered through provider secret controls or environment tooling. Never ask the user to paste secrets into source files or commit them.

## Modes

- For a readiness or checklist request, inspect and report only; do not create or mutate provider resources.
- For an explicit setup/deploy request, carry the checklist through to observable verification. Creating provider projects, changing DNS, or connecting GitHub are external mutations and must remain within the user's stated scope.

## Deployment invariants

- Railway hosts one backend service and one PostgreSQL service from `.railway/railway.ts`.
- Backend deploys run database migrations before startup and must pass `GET /api/health`.
- Railway production follows the selected GitHub branch; pull requests get isolated/focused environments containing backend and PostgreSQL when watched paths change.
- Vercel uses two projects from the same repository: `apps/web` for the SPA and `apps/web-ssr` for TanStack Start SSR.
- Both Vercel projects deploy production from the selected branch and previews from pull requests. Affected-project deployment filtering remains enabled.
- Both frontends receive `VITE_API_URL` for preview and production. Preview values must reach an appropriate backend; do not silently point untrusted previews at production if the user requires isolation.
- The backend's auth URL, trusted origins, cookie domain, Google OAuth configuration, and all three custom domains agree.
- No provider IDs, account names, domains, repository names, or secrets from the original template owner are reused implicitly.

Prefer provider connectors or supported CLIs for state inspection and changes. Keep `.railway/railway.ts` as Railway's source of truth, and never commit `.vercel/project.json`, pulled `.env*` files, access tokens, or generated build output.

For setup or preview-pipeline work, finish when local checks and a pull request prove the integrations, then report that production still awaits an authorized merge. For an explicitly authorized full release, continue until production deployments are healthy and the custom hostnames serve the intended applications. In either mode, report preview URLs, health results, and any manual DNS/OAuth action still outstanding.
