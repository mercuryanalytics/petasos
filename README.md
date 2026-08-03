# petasos

Mercury Analytics — monorepo for the customer-facing analytics application.

| Directory | What it is | Setup docs |
|---|---|---|
| `api/` | Rails API-only backend | [api/README.md](api/README.md) |
| `ui/` | React frontend (Vite) | [ui/README.md](ui/README.md) |
| `sso/` | `mercury_sso_auth0` gem | [sso/README.md](sso/README.md) |

Local development setup lives in [ui/README.md](ui/README.md) — it covers both halves.

## Environments

| | Production | Staging |
|---|---|---|
| Frontend | researchresultswebsite.com | staging.researchresultswebsite.com |
| Backend | api.researchresultswebsite.com | api-staging.researchresultswebsite.com |
| Rails host | `petasos.us-east-1` | `petasos-staging.us-east-1` |
| Database | production RDS | **the same production RDS** |
| `RAILS_ENV` | `production` | `production` |

Staging is not an isolated environment. It shares production's database and runs
under `RAILS_ENV=production`. It exists to answer two questions that dev cannot:

1. Does this behave correctly against real production data?
2. Does this behave correctly on the production platform? Dev is puma-dev on
   macOS/arm64; production is Passenger Standalone on Linux/x86_64, and the
   difference occasionally matters.

Because it shares the production database, **`deploy:migrate` is disabled for the
staging stage** (see `api/config/deploy/staging.rb`). Migrations run from
production deploys only. A change that needs a migration cannot be meaningfully
smoke-tested on staging before that migration has run in production.

## Deploying

### Frontend — automatic

Merging to `main` with changes under `ui/**` triggers `petasos-codepipeline`,
which builds and syncs to S3 and invalidates CloudFront. **This goes straight to
production with no gate.** There is no approval step and no staging pass first.

Pushing `staging` with changes under `ui/**` triggers `petasos-staging-codepipeline`
and does the same for the staging bucket.

Both pipelines run the root `buildspec.yml`; bucket and CloudFront distribution
come from per-project environment variables, not from this repo. Both are defined
in `hg-terraform/petasos.tf` (`aws_codepipeline.petasos` and
`aws_codepipeline.petasos_staging`), along with their CodeBuild projects, both
environments' S3 buckets and CloudFront distributions, and the CodeStar GitHub
connection. They are
CodePipeline V2 with an explicit `trigger` block filtered to `ui/**` on their
respective branch, and `DetectChanges = "false"` — the trigger is the only thing
that starts them, there is no polling fallback.

Backend-only changes trigger neither pipeline.

### Backend — manual, via Capistrano

Run from `api/`:

```bash
bundle exec cap production deploy   # deploys origin/main
bundle exec cap staging deploy      # deploys origin/staging
```

Deploys require SSH access to the target box as `deployer`, with agent forwarding
(the box pulls from GitHub itself).

### The `staging` branch is a pointer, not an integration branch

`staging` names *whatever is currently on the staging box*. It is always
force-pushed and never merged — not into, not out of.

```bash
# smoke-test what's about to ship
git push -f origin origin/main:staging
cd api && bundle exec cap staging deploy

# smoke-test a branch before merging it
git push -f origin my-feature:staging
cd api && bundle exec cap staging deploy
```

Never open a PR against `staging` and never merge it back into `main`. Doing so
lets it accumulate commits of its own, at which point it stops being a preview of
what will ship and becomes a third codebase to reconcile. This has already
happened once, during the Rails 6.1→8.1 upgrade.

Using staging is optional. Plenty of changes do not need it.

### Resync staging after you are done with it

Once whatever you were smoke-testing has merged, point `staging` back at `main`.
Left pointing at a merged feature branch, it stops being a preview of what ships
and the next person to use it starts from a stale base.

```bash
git push -f origin origin/main:staging
cd api && bundle exec cap staging deploy
```

Two steps, because staging is asymmetric the same way production is: the frontend
pipeline fires off the branch push, the Rails half does not move until someone
runs Capistrano. Skip the second and the staging frontend runs ahead of the
staging API — the same full-stack breakage described below, just somewhere you
would rather find it.

This is still a force-push, not a merge. Moving the pointer is the model; merging
is what breaks it.

For a change that needs a migration, resync *after* the production deploy has run
it. Staging shares production's database and cannot migrate, so resyncing first
gives you new code against an old schema, on the live database.

## Rules

**Deploy the API before merging a full-stack PR.** The frontend ships to
production the moment you merge; the backend ships whenever someone next runs
Capistrano. So a PR that touches both `ui/` and `api/` will put a frontend in
production that is calling an API that does not exist yet.

If a UI change depends on a backend change, land and deploy the backend first:

1. Split the backend change into its own PR, merge it, `cap production deploy`.
2. Then merge the UI PR.

If they genuinely cannot be split, deploy the API from the feature branch
(`BRANCH=my-feature bundle exec cap production deploy` — requires adding
`set :branch, ENV.fetch("BRANCH", "main")` to `deploy.rb`) before merging, or
accept a brief window of breakage and merge during low traffic.

**Nothing is protected.** Neither `main` nor `staging` has branch protection. A
direct push to `main` touching `ui/**` deploys to production immediately, with no
review and no CI gate. Use PRs.

**Re-dump `schema.rb` after any Rails version bump.** Production runs migrations
rather than `schema:load`, so a stale dump goes unnoticed until someone sets up a
fresh database.
