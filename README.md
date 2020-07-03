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
