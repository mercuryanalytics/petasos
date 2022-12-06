# Deployment Changes for Workbench

* Add SSO environment variables to `/var/www/talaria/shared/environment` on `aws0`, `aws1`, `aws2`
* Merge `sso-integration` branch into `master` and deploy
* Send account map to aws0 `scp account-map.csv aws0.us-east-1:account-map.csv:`
* Run census unmap script `bin/rake sso_import:unmap_owners`
* Run census import script `bin/rake sso_import:map_owners[$HOME/account-map.csv]`