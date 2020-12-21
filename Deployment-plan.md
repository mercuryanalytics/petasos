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
2. Set up new front-end buckets; `ratethedebate.com` should be the primary bucket, and `www.ratethedebate.com` is the alias (other aliases to be determined).
3. Test run the database import tasks.
  1. Drop current ratethedebate database
  2. Recreate it from the migrations (`rake db:setup`)
  3. Run the import script
  4. Run the scope-creation script
  5. Run the census export script
  6. Run the census import script

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

---

## Frontend Deployment Changes

### Reconfigure AWS CodePipeline

* Edit `Mercury-Analytics-Codepipeline-Demo` (Edit > Edit build), selecting the `mercuryanalytics/mercury-analytics-frontend` repo's master branch.
* Choose the correct distribution ID (`E9FR9DKG3N589`) and Bucket name (`www.researchresultswebsite.com`) that points to researchresultswebsite.com.

### Reconfigure AWS Chatbot
* Edit the `AWS-Codepipeline-Frontend-Notifications` topic. Select `Mercury-Analytics-Codepipeline-Demo`.
* Modify `src/auth-config.js` to point to `auth.researchresultswebsite.com`
```
const authConfig = {
  domain: 'auth.researchresultswebsite.com',
```

### Configure Auth0
* Change the custom domain to be `auth.researchresultswebsite.com`
* Change the DNS entry for `auth.researchresultswebsite.com` to be the CNAME indicated.
* Verify the domain.

### Configure DNS
* `researchresultswebiste.com` and subdomains other than `api` and `auth` should be pointing to the S3 bucket.
* `api.researchresultswebsite.com` should be pointing to the backend server.
* `auth.researchresultswebsite.com` should be a CNAME for the auth0 domain, as set in the Auth0 config.

## Backend Deployment Changes

Run `bundle exec rails credentials:edit` to make the following changes:

```
secret_key_base: 6ee7476c8e3ecdc24defe972151a802f33746cf4a83e97a3c2570cc0ab9937ff33accd63d724bbc431bf7fc44d4d62e9a2e0fc2c31773409ecb64f2b549f7b34
app_host: https://www.researchresultswebsite.com/

auth0:
  iss: https://auth.researchresultswebsite.com/
  audience: https://www.researchresultswebsite.com/
    
management_api:
  base_url: https://auth.researchresultswebsite.com/
  client_id: XfTCmnYbCiePNBBcYsWsT4yTdCcvj71Z
  client_secret: fgRDJDUAWObqUFKnAA_s1D1YvKKVq3pDq0BnLvkEmYP8Pdyjhste9boeS0pBKMR
  audience: https://auth.researchresultswebsite.com/api/v2/
    
aws:
  access_key_id: AKIA3VZQKJDI5NKH33K2
  secret_access_key: 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
  region: us-east-1
  bucket: www.researchresultswebsite.com
```

Check in the modified `config/credentials.yml.enc` and deploy.
