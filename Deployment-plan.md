# Deployment Changes for RRW

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

* Go to root project
* Run EDITOR=vim bundle exec rails credentials:edit

Changes to be made in the file is as follows
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
* Switch over DNS entries