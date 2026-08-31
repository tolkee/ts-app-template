# Railway, Vercel, and GitHub deployment checklist

Use this checklist for the topology already proven by the template. Replace all example identities with the fork's values.

## 1. Preflight

- Confirm `$init-fork` has removed the original package scope, repository, domains, and infrastructure names.
- Confirm the intended production branch exists on GitHub and the working state is pushed.
- Run `bun install --frozen-lockfile`, `bun run quality`, `bun run typecheck`, `bun run test`, and `bun run build`.
- Confirm the GitHub app installations for Railway and Vercel can access the forked repository.
- Record:
  - GitHub `owner/repository`
  - production branch
  - Railway workspace
  - Vercel team
  - `api` hostname
  - SPA hostname
  - SSR hostname
  - shared cookie domain

## 2. Prepare authentication configuration

Create or obtain these values without committing them:

- `BETTER_AUTH_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

Configure the Google OAuth client with the deployed frontend origins and the callback URL expected by the backend authentication routes. The exact callback path must be taken from the running auth configuration rather than guessed.

The backend production environment must contain:

- `ENV=prod`
- `PORT=3000`
- `DATABASE_URL` from Railway PostgreSQL
- `BETTER_AUTH_URL=https://<api-host>`
- `TRUSTED_ORIGINS=https://<spa-host>,https://<ssr-host>`
- `AUTH_DOMAIN=<shared-cookie-domain>`
- the three preserved secret values above

## 3. Railway: PostgreSQL and backend

Update `.railway/railway.ts` before applying it:

- `github("owner/repository", { branch: "<production-branch>", checkSuites: true })`
- `project("<slug>")`
- production backend custom domain and port `3000`
- auth URL, trusted origins, and cookie domain

Preserve these existing service behaviors:

- PostgreSQL service named `Postgres`
- backend service named `backend`
- watched paths for `apps/backend`, shared packages, root `package.json`, `bun.lock`, and `turbo.json`
- start command `cd apps/backend && bun run start`
- pre-deploy migration `cd apps/backend && bun run db:migrate`
- health check `/api/health`, timeout 30 seconds
- restart on failure
- `preserve()` for secrets

Then:

1. Authenticate the Railway CLI/connector in the intended workspace.
2. Create or select the project and production environment.
3. Add the secret variables before or immediately after the first IaC apply, as required by the provider workflow.
4. Run `railway config plan`, review the exact resource diff, and run `railway config apply` only after the target is confirmed.
5. Connect the service to GitHub if the IaC/provider flow has not already done so.
6. Set the selected production branch and keep GitHub check-suite integration enabled.
7. Enable pull-request environments and focused PR environments. Use production as their base so backend and PostgreSQL configuration are cloned without sharing production data.
8. Ensure PR environments are removed automatically when their pull requests close.
9. Attach the API custom domain and complete the DNS record Railway requests.

Do not add a public domain to PostgreSQL.

## 4. Vercel: SPA project

Create a Vercel project named `<slug>-web` from the same GitHub repository:

- root directory: `apps/web`
- framework: Vite
- build command: `bun run build`
- output directory: `dist`
- Node.js runtime: the repository-supported current runtime (24.x for the proven setup)
- preview deployments: enabled
- affected-project deployments: enabled
- production branch: selected GitHub production branch

Set `VITE_API_URL=https://<api-host>` for production. Set an intentional value for preview; use the Railway PR backend when the provider integration can map it safely, otherwise document the chosen preview policy.

Attach the SPA custom domain and complete Vercel's requested DNS records.

## 5. Vercel: SSR project

Create a second Vercel project named `<slug>-web-ssr`:

- root directory: `apps/web-ssr`
- framework: Vite / TanStack Start
- build command: `bun run build`
- output directory: framework-generated Vercel Build Output API directory; do not force `dist`
- Node.js runtime: the repository-supported current runtime (24.x for the proven setup)
- preview deployments: enabled
- affected-project deployments: enabled
- production branch: selected GitHub production branch

Set `VITE_API_URL` for production and preview using the same policy as the SPA. Attach the SSR custom domain and complete DNS validation.

Keep the tracked `apps/web/vercel.json` and `apps/web-ssr/vercel.json`. Do not commit `.vercel/project.json`, provider link directories, downloaded environment files, or access tokens.

## 6. GitHub integration proof

Open a small, real pull request that changes a watched dependency or relevant app file. Verify all of the following against that exact commit:

- Vercel creates successful preview checks for the SPA and SSR projects, or explicitly skips an unaffected project according to affected-project settings.
- Railway creates an isolated PR environment when a backend watched path changes.
- Railway provisions or clones PostgreSQL for that environment.
- backend migrations finish and the preview deployment reaches `SUCCESS`.
- `/api/health` returns HTTP 200.
- the deployed SPA renders without browser console errors.
- the deployed SSR app renders, redirects unauthenticated users correctly, and has no hydration or browser console errors.

Keep the pull request open if the user asked only for proof. Do not merge it without authorization.

## 7. Production release proof

After an authorized merge or promotion:

- Railway production is built from the merge commit, migrations succeed, and `https://<api-host>/api/health` returns 200.
- Vercel production deployments for both projects are `READY` and correspond to the merge commit.
- SPA and SSR custom domains resolve over HTTPS and call the intended API.
- authentication works from both origins and cookies use the intended shared domain and security attributes.
- Google OAuth succeeds through its full redirect/callback flow.
- provider runtime logs show no deployment, migration, authentication, CORS, or hydration failures.

Report project names, deployment identifiers or URLs, commit SHA, health result, preview behavior, and any remaining manual DNS or OAuth work. Never expose secret values in the report.
