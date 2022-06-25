# mercury-analytics-ui
React interface to replace the old Flash of Mercury Analytics

# Setting up a dev environment

## Checking out the repositories

* Create a folder called `petasos`.
* Check out `mercuryanalytics/mercury-analytics-api` into `petasos/api`.
* Check out `mercuryanalytics/mercury-analytics-frontend` into `petasos/ui`.
* Set up a `puma-dev` link that points `petasos-api.test`.
  * `puma-dev link -n petasos-api`
* Run `npm run start` from the `petasos/ui` folder.
