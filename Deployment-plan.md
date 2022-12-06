# Deployment Changes for RRW

The following systems need to be updated:
1. [[SSO Front end|Front end deployment]]
2. [[SSO Back end|Back end deployment]]
3. [[Auth0|Auth0 deployment]]
4. [[AWS CodePipeline|CodePipeline deployment]]
5. [[AWS Chatbot|CodePipeline deployment]]
6. [[Workbench|Workbench deployment]]
7. [[NBCU Data Capture|NBCU deployment]]

## Pre deployment
1. Try to rename `api.ratethedebate.com` to `api.researchresultswebsite.com` and configure the front end to point there with no other changes.
2. Set up new front-end buckets; `researchresultsweb.com` should be the primary bucket, with no alias buckets needed.
3. Test run the database import tasks.
   1. Drop current ratethedebate database
   2. Recreate it with `rake db:setup` then `rake db:seed`
   3. Run the import script
   4. Run the scope-creation script `rake scopes:create:talaria`
   5. Run the census export script `rake util:census` with same params as the import
     
   STOP HERE UNTIL GO LIVE TIME
     
   6. Run the census unmap script `bin/rake sso_import:unmap_owners` on aws0
   7. Run the census import script `bin/rake sso_import:map_owners[$HOME/account-map.csv]` on aws0

## Deployment steps
1. Change AWS CodePipeline and Chatbot to deploy to `researchresultswebsite.com`.
2. Change frontend auth-config to use `auth.researchresultswebsite.com`, and deploy.
3. Run the auth_id export task `RAILS_ENV=production bundle exec rake util:export_auth_ids > auth_ids.csv`.
4. Declare maintenance phase.
5. Reimport the petasos database.
6. Clear the application cache `rm -f tmp/cache/???`
7. Stop the old SSO server.
8. Run the auth_id import task `RAILS_ENV=production bundle exec rake util:import_auth_ids[auth_ids.csv]`.
9. Run the scope-creation rake task `RAILS_ENV=production bundle exec rake scopes:create:talaria`.
10. Run the census rake task and import it to workbench `RAILS_ENV=production bundle exec rake util:census > census.csv` and `RAILS_ENV=staging NEWRELIC_ENABLE=false rbenv exec bundle exec rake sso_import:unmap owners sso_import:map_owners[$HOME/census.csv]`.
11. Deploy SSO backend with modified config.
12. Deploy workbench with modified config.
13. Deploy nbcu-data-capture with modified config.
14. Change auth0 custom domain name to `auth.researchresultswebsite.com` and get it verified.
15. Change DNS entries to point to the new S3 buckets.
16. Smoke test.
17. Announce end of maintenance.

Deferred steps:

* Run auth0 sync `rake import:synchronize_auth`
