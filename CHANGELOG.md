# Changelog

Generated from [conventional commits](https://www.conventionalcommits.org).
## [Unreleased]

### Bug Fixes
- Relax email regex check
- **ui:** Resolve all npm start warnings and open correct dev URL (#2)
- **deploy:** Update Capistrano config for monorepo and new GitHub org (#4)
- **ui:** Drop low-res favicon PNGs to reduce aliasing (#22)
- **cors:** Allow researchresultswebsite.com and its subdomains
- **deps:** Drop certified gem; use system CA bundle
- **db:** Defer NOT NULL on active_storage_blobs.service_name
- **ui:** Skip whitelabel partner lookup outside production (#26)
- **db:** Restore NOT NULL on active_storage_blobs.service_name (#23)
- **spec:** Exercise duplicate-name scenario in CreateProjectOrganizer (#29)
- **api:** Pin stringio to 3.1.1 to unblock Passenger spawn on Ruby 3.3.4
- **ui:** Restore Tooltip and Scrollable global CSS overrides (#52)
- **api:** Restore file logging + add lograge JSON request logs (Rails 8.1) (#55)
- **api:** Stop CanCanCan building client logo on authorize (Rails 8.1) (#54)
- **deps:** Clear bundler-audit CVEs blocking api CI (#65)

### Build
- **ui:** Migrate from Create React App to Vite

### CI
- **api:** Bootstrap RSpec workflow on main (#30)
- **api:** Skip RSpec on draft PRs
- Automate CHANGELOG.md from conventional commits (#39) (#64)
- **api:** Baseline 8 pre-existing Brakeman warnings to unblock gate (#66)

### Chores
- **ui:** Add prettier with eslint integration (#3)
- **branding:** Replace Mercury logo assets for new brand (#7)
- **branding:** Update default backend logo color
- **api:** Upgrade Rails 6.0.2 to 6.1.7
- **api:** Upgrade Ruby 2.5.3 to 3.3.4
- **deps:** Pin base64 to ~> 0.2.0 for Passenger compatibility
- **deps:** Replace deprecated mingw/x64_mingw platforms with :windows
- **deploy:** Modernize Capistrano config for the new EC2 AMI
- **deploy:** Pin staging deploys to the `staging` branch (#27)
- **deps:** Scope puma to development/test
- **rails:** Finish the deferred 6.1 framework-defaults flip (#28)
- **deps:** Drop spring, bump faker, loosen webmock and listen pins
- **deps:** Bump puma '~> 4.1' -> '~> 6.4' (dev/test only)
- **deps:** Bump rspec-rails '~> 5.1' -> '~> 6.1'
- **deps:** Bump factory_bot '~> 5.1' -> '~> 6.4'
- **deps:** Bump shoulda-matchers '~> 4.3' -> '~> 6.4'
- **deps:** Replace database_cleaner with database_cleaner-active_record
- **config:** Mark Mercury customizations in application.rb
- **config:** Mark Mercury customizations in development.rb
- **config:** Mark Mercury customizations in test.rb
- **config:** Mark Mercury customizations in production.rb
- **hooks:** Add lefthook + commitlint + commitizen (#35)
- Repo hygiene — editorconfig, CI workflows, lockfile cleanup (#40)
- **api:** Bump rails to 7.0 (phase 1, step A)
- **api:** Flip framework defaults to 7.0 (phase 1, step B)
- **api:** Bump rails to 7.1 (phase 2, step A)
- **api:** Flip framework defaults to 7.1 (phase 2, step B)
- **api:** Bump rails to 7.2 (phase 3, step A)
- **api:** Flip framework defaults to 7.2 (phase 3, step B)
- **ui:** Add --delete to s3 sync so deletions propagate
- Ignore api/.claude/*.local.* alongside top-level .claude
- **api:** Bump rails to 8.0 (phase 4, step A)
- **api:** Flip framework defaults to 8.0 (phase 4, step B)
- **api:** Bump rails to 8.1 (phase 5, step A)
- **api:** Flip framework defaults to 8.1 (phase 5, step B)

### Documentation
- Update CLAUDE.md after CRA → Vite migration
- Hide the superpowers-generated docs from the repo
- **changelog:** Update [skip ci]
- **changelog:** Update [skip ci]
- **changelog:** Update [skip ci]
- **changelog:** Update [skip ci]

### Features
- Petasos staging backend support (#6)
- **sso:** Expose true Auth0 session expiration to consumers
- **api:** Add staging Rails environment loading production config (#56)
- **api:** Add brand_lift_benchmarks scope, drop retired Biometrics Access (#59)

### Refactoring
- **api:** Clarify implicit auth in UsersController + ReportAbility (#12, #15, #16) (#62)

### Tests
- **api:** Add Auth0/JWT integration spec foundation
- **api:** Add request specs for base_controller + clients
- **api:** Add request specs for projects + reports controllers
- **api:** Add request specs for users + scopes controllers
- **api:** Add request specs for domains + templates controllers
- **api:** Add request specs for logo + password_reset controllers
- **api:** Add CanCanCan ability matrix specs
- **api:** Cover authorizations interactors with success and primary-failure specs
- **api:** Cover clients interactors with success and primary-failure specs
- **api:** Cover projects interactors with success and primary-failure specs
- **api:** Cover reports interactors with success and primary-failure specs
- **users:** Cover local-only interactors with success and primary-failure specs
- **users:** Cover Auth0-touching interactors with WebMock-stubbed specs
- **api:** Add specs for six untested models
- **api:** Expand user_mailer spec with one example per delivered message
- **ui:** Define and seed a UI test suite (#38) [ENG-15] (#57)
## [legacy-production] - 2022-12-02
