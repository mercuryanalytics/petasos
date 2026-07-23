# mercury-analytics-ui
React interface to replace the old Flash of Mercury Analytics

# Setting up a dev environment

## Checking out the repositories

* Create a folder called `petasos`.
* Check out `mercuryanalytics/mercury-analytics-api` into `petasos/api`.
* Check out `mercuryanalytics/mercury-analytics-frontend` into `petasos/ui`.
* Set up a `puma-dev` link that points `petasos-api.test`.
  * `puma-dev link -n petasos-api`
  * This is a symlink to `petasos/api`, so puma-dev boots Rails on demand — nothing to start by hand.
* Point `petasos.test` at the frontend dev server. Unlike the API, this is a
  plain port file (not an app symlink), so puma-dev only *proxies* to it — you
  still have to start the server yourself.
  * `echo 3004 > ~/.puma-dev/petasos`
* Run `npm run start` from the `petasos/ui` folder to start Vite (pinned to
  `127.0.0.1:3004` in `vite.config.js` to match).
* Open https://petasos.test — the UI calls the API at `petasos-api.test`.
