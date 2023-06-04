# Backend Deployment

Run `bundle exec rails credentials:edit` to make the following changes:

```
secret_key_base: ...
app_host: https://www.researchresultswebsite.com/

auth0:
  iss: https://auth.researchresultswebsite.com/
  audience: https://www.researchresultswebsite.com/
    
management_api:
  base_url: https://auth.researchresultswebsite.com/
  client_id: ...
  client_secret: ...
  audience: https://auth.researchresultswebsite.com/api/v2/
    
aws:
  access_key_id: ...
  secret_access_key: ...
  region: us-east-1
  bucket: www.researchresultswebsite.com
```

Check in the modified `config/credentials.yml.enc` and deploy.
