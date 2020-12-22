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
2. Set up new front-end buckets; `researchresultsweb.com` should be the primary bucket, and `www.researchresultsweb.com` is the alias (other aliases to be determined).
3. Test run the database import tasks.
  1. Drop current ratethedebate database
  2. Recreate it from the migrations (`rake db:setup`)
  3. Run the import script
  4. Run the scope-creation script
  5. Run the census export script
  6. Run the census unmap script
  7. Run the census import script

## Deployment steps
1. Change AWS CodePipeline and Chatbot to deploy to `researchresultswebsite.com`.
2. Change frontend auth-config to use `auth.researchresultswebsite.com`, and deploy.
3. Declare maintenance phase.
4. Reimport the petasos database.
5. Stop the old SSO server.
6. Run the scope-creation rake task.
7. Run the census rake task and import it to workbench.
8. Deploy SSO backend with modified config.
9. Deploy workbench with modified config.
10. Deploy nbcu-data-capture with modified config.
11. Change auth0 custom domain name to `auth.researchresultswebsite.com` and get it verified.
12. Change DNS entries to point to the new S3 buckets.
13. Smoke test.
14. Announce end of maintenance.
