---
name: init-fork
description: Initialize a fork of this monorepo by changing technical package, repository, and infrastructure identity while preserving the Todo product domain and behavior. Use when someone forks the template or asks to rename/rebrand its project namespace; do not use for product feature renaming.
---

# Init Fork

Ask for the new project name before editing unless the user already supplied it. Normalize it to a lowercase npm-safe kebab-case slug and state the derived scope (`@<slug>`) before proceeding. Ask only when normalization would be ambiguous or destructive.

Read [references/rename-map.md](references/rename-map.md) before editing. It records the current repository inventory and the boundary between technical identity and the Todo product.

## Required outcome

- Rename every workspace app and package from `@todo/<suffix>` to `@<slug>/<suffix>` while preserving each suffix.
- Set the root private package name and Railway project name to `<slug>`.
- Rename infrastructure labels derived from the template identity, including the Docker Compose project and future Vercel project names.
- Remove the original template repository, domain, and project identity from tracked configuration.
- Keep Todo feature names, routes, API paths, database schema, types, errors, UI copy, and documentation examples that describe the product.

Never perform a repository-wide replacement of the word `todo`.

## Workflow

1. Inspect `git status` and preserve unrelated or user-owned changes. Do not overwrite a dirty file without reviewing the overlap.
2. Re-run the tracked-file searches in the rename map. Treat the map as a baseline, not a substitute for discovery.
3. Resolve the fork's GitHub `owner/repository` from the `origin` remote or GitHub tooling. If it still points at the template and cannot be inferred, ask for it before changing Railway's GitHub source.
4. Apply the namespace and identity changes only to technical references. Update imports, dependency names, TypeScript `extends`, shadcn aliases, Docker prune targets, documentation snippets, and deployment configuration together.
5. If production domains were not provided, replace the template owner's domains with safe placeholders based on `<slug>.example.com`; clearly report that `$init-deploy` must replace them before release. Never retain `tolkee.dev` in a fork by default.
6. Regenerate `bun.lock` with `bun install`; do not hand-maintain workspace resolution entries when the package manager can do it.
7. Re-run the audit, excluding `.agents/skills/**` because these reusable instructions intentionally document the template's original markers. No other tracked technical reference to `@todo/`, `ts-app-template`, `tolkee/ts-app-template`, or `*.todo.tolkee.dev` may remain. Product-side `todo` references are expected.
8. Run `bun run quality`, `bun run typecheck`, `bun run test`, and `bun run build`. Report any validation that could not run.

Do not edit or commit ignored Vercel link metadata, generated build output, local environment files, or secrets.
