# Railway infrastructure

`railway.ts` is the source of truth for this project's Railway resources.

Before the first apply, create the shared `BETTER_AUTH_SECRET`, `GOOGLE_CLIENT_ID`, and
`GOOGLE_CLIENT_SECRET` variables in the target Railway environment. For a fork, also update the
GitHub repository, production branch, project name, and domains in `railway.ts`.

Review changes before applying them:

```sh
railway config plan
railway config apply
```
