# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Structure

This is a monorepo for Mercury Analytics, containing:

- `api/` — Rails 6 API-only backend (Ruby 2.5.3, PostgreSQL)
- `ui/` — React 16 frontend (Create React App, Redux)
- `sso/` — `mercury_sso_auth0` Ruby gem for Auth0 SSO authentication

## API (Rails)

### Commands

```bash
cd api

# Start server (puma-dev links to petasos-api.test)
bundle exec rails s

# Run all tests
bundle exec rspec

# Run a single test file
bundle exec rspec spec/models/user_spec.rb

# Run a single example by line number
bundle exec rspec spec/models/user_spec.rb:42

# Lint
bundle exec rubocop

# DB
bundle exec rails db:migrate db:test:prepare
```

### Architecture

- **API-only Rails app** under `api/v1` namespace; base controller at `app/controllers/api/v1/base_controller.rb`
- **Authentication**: JWT via Auth0; the `sso/` gem provides `MercurySsoAuth0::Authenticated` mixin for controllers
- **Authorization**: CanCanCan — abilities defined in `app/abilities/`
- **Business logic**: Interactor pattern in `app/interactors/`
- **Serialization**: ActiveModelSerializers in `app/serializers/`
- **API docs**: Swagger/OpenAPI via rswag, mounted at `/api-docs`
- **Data hierarchy**: Clients → Projects → Reports; Users associated to Clients via Memberships
- **Scopes**: Two types — dynamic (resource-specific) and global — used for flexible permission modeling
- **Domain management**: `app/models/domain.rb` enables corporate SSO/SAML access by email domain

### Testing

RSpec with FactoryBot, DatabaseCleaner (transaction strategy), and WebMock. Factories in `spec/factories/`. Test coverage spans `spec/controllers/`, `spec/models/`, `spec/interactors/`, `spec/mailers/`.

## UI (React)

### Commands

```bash
cd ui

# Install dependencies
yarn

# Start dev server (port 3004)
npm start

# Run tests
npm test

# Production build
npm run build

# Build + deploy to S3 + CloudFront invalidation
npm run s3deploy
```

Set `NODE_OPTIONS=--openssl-legacy-provider` (already in `.envrc`) before running npm commands.

### Architecture

- **State management**: Redux + Redux-Thunk; store split by domain in `src/store/` (auth, clients, projects, reports, users, location)
- **Routing**: React Router v5 in `src/App.js`
- **Auth**: Auth0-JS browser SDK configured in `src/auth-config.js`; auth state managed in `src/store/auth/`
- **Screens**: Full page views in `src/screens/` (17 screens)
- **Components**: Reusable UI in `src/components/` (Auth, FormFields, common, SideMenu, Header, Icons)
- **Forms**: react-final-form

## SSO Gem

The `sso/` directory contains a standalone gem (`mercury_sso_auth0`). Include `MercurySsoAuth0::Authenticated` in any controller to require JWT auth. Exposes `current_user` and `user.scopes(session)` for CanCanCan integration.

## Local Dev Setup

- Use `puma-dev` to serve the API at `petasos-api.test`: `puma-dev link -n petasos-api` from `api/`
- The UI dev server proxies to the puma-dev host
- Environment variables managed via `direnv` (`.envrc` at repo root)

## Deployment

- **Frontend**: AWS CodeBuild (`buildspec.yml`) builds React and syncs to S3 (`researchresultswebsite.com`), then invalidates CloudFront distribution
- **Backend**: Capistrano (gem in Gemfile); production uses RDS credentials from Rails encrypted credentials
