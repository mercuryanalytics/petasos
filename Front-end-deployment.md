# Front end deployment

These changes are necessary to deploy the front-end code to its new host name, `researchresultswebsite.com`.

## Reconfigure AWS CodePipeline

* Edit `Mercury-Analytics-Codepipeline-Demo` (Edit > Edit build), selecting the `mercuryanalytics/mercury-analytics-frontend` repo's master branch.
* Choose the correct distribution ID (`E9FR9DKG3N589`) and Bucket name (`www.researchresultswebsite.com`) that points to researchresultswebsite.com.

## Reconfigure AWS Chatbot
* Edit the `AWS-Codepipeline-Frontend-Notifications` topic. Select `Mercury-Analytics-Codepipeline-Demo`.
* Modify `src/auth-config.js` to point to `auth.researchresultswebsite.com`
```
const authConfig = {
  domain: 'auth.researchresultswebsite.com',
```