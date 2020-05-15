# mercury-analytics-api
API side of Mercury Analytics (including Identity Provider)

# import 
`bundle exec rake import:database_data -- --db-name=petasos --db-user=root --db-pass='password' --db-host=localhost`

# sync users with auth0
`bundle exec rake import:synchronize_auth`
