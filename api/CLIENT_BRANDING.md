# How to setup client branding

## AWS Changes
* Go to your AWS Route 53
* Setup the subdomains (`A` and `AAA`) and point it to your Cloudfront distribution as an alias (the `www.domain.com` one)
* Go to your distribution settings
* Select your distribution and hit the `Distribution Settings` button
* Hit the `Edit` button in `General` tab
* In the `Alternate Domain Names` add your new subdomain and save the new settings
* Go to `Invalidations` and create a new invalidation for the settings to propagate

## Auth0 changes
* Go to your `Single Page App` on Auth0
* In `Application URIs` add your new subdomain for:
    * `Allowed Callback URLs`, 
    * `Allowed Logout URLs`
    * `Allowed Web Origins`
    * `Allowed Origins (CORS)`
    
Note: You can add a wildcard policy (`https://*.domain.com`) here for subdomains so you won't have to change it in the future
