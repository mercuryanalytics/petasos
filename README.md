# mercury-analytics-api
API side of Mercury Analytics (including Identity Provider)

# import 
`bundle exec rake import:database_data -- --db-name=petasos --db-user=root --db-pass='password' --db-host=localhost`

# sync users with auth0
`bundle exec rake import:synchronize_auth`


# Add new dynamic scope
In order to add a new dynamic scope, you'll need to run the following rake task:
`bundle exec rake scopes:create -- --action=do_something --scope=projects --description="small description of the scope" --name scope_name`

Note that the `scope` argument should be a value from `clients`, `projects`, `reports`


# Generate reports
## Generate a report containing the users (contact name and email) which are researchers
`RAILS_ENV=production bundle exec rake reports:researchers`

## Generates a report containing the clients name and its respective users, with the following user attributes:
` email company_name contact_name contact_title contact_phone contact_fax contact_email mailing_address_1 mailing_address_2 mailing_city mailing_state mailing_zip mailing_country`

`RAILS_ENV=production bundle exec rake reports:client_accounts`

## Generates a report containing the Partner Clients (client name, client contact name, client contact email)

`RAILS_ENV=production bundle exec rake reports:partner_clients`

Note: the reports are generated in the `public` folder, a message will appear after the generation is completed containing the file name.
The script will output `Generated the file in public/report-partner-12-45-09-07.csv`
To download the file, visit your api url with the `report-partner-12-45-09-07.csv` in path and it should prompt for file download (eg: `http://api.researchresultswebsite.com/report-user-researchers-12-49-09-07.csv`)
You should remove that file after downloading
