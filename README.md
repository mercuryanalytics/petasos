# mercury-analytics-api
API side of Mercury Analytics (including Identity Provider)

# import 
`bundle exec rake import:database_data -- --db-name=petasos --db-user=root --db-pass='password' --db-host=localhost`

# import single client
`bundle exec rake import:client_import -- --db-name=petasos --db-user=root --db-pass=password --db-host=localhost --client-name="Mercury Analytics"`

Please note that the client name has to be written between "" if it contains spaces

# Generate user permissions report
`bundle exec rake users:audit\[ronh@mercuryanalytics.com\] > ronh.txt`

This will generate a file with all permissions assigned for the user

Sample below
```
$ bundle exec rake users:audit\[ronh@mercuryanalytics.com\]
User is ronh@mercuryanalytics.com
User ronh@mercuryanalytics.com has the following global permissions:
Global admin
Researcher
Client Benenson - with the following permissions: client_access, client_editor, viewer
	 Project 1352 (iMod 8152) Toyota AD Test - with the following permissions: viewer
		 Report Toyota survey results "Likeability" - with the following permissions: report_admin, report_editor, viewer
		 Report Toyota survey results "Relevant" - with the following permissions: report_admin, report_editor, viewer
		 Report Toyota survey results "Engagement" - with the following permissions: report_admin, report_editor, viewer
		 Report Final Survey Results Overall - with the following permissions: report_admin, report_editor, viewer
		 Report Survey results "Likeability" - with the following permissions: report_admin, report_editor, viewer
		 Report Survey results "Engagement" - with the following permissions: report_admin, report_editor, viewer
		 Report Interim Survey Results - with the following permissions: report_admin, report_editor, viewer
		 Report Survey results "Relevant" - with the following permissions: report_admin, report_editor, viewer
	 Project 1638 Sonic Menu Testing - with the following permissions: project_access, project_admin, project_editor, viewer
		 Report 4: Results for all survey participants - with the following permissions: report_admin, report_editor, viewer
		 Report 1: Tabs Results - with the following permissions: report_admin, report_editor, viewer
		 Report 3: Quads Results - with the following permissions: report_admin, report_editor, viewer
		 Report 2: Slider Results - with the following permissions: report_admin, report_editor, viewer
	 Project 1352 (iMod 8152) Toyota AD Test - with the following permissions: project_access, project_admin, project_editor, viewer
Client Mercury Analytics - with the following permissions: client_access, client_editor, viewer
	 Project MERC0001 Capabilities Demonstration - with the following permissions: viewer
		 Report Capabilities Demonstration - with the following permissions: report_admin, report_editor, viewer
		 Report Capabilities Demonstration - with the following permissions: report_admin, report_editor, viewer
		 Report Capabilities Demonstration - with the following permissions: report_admin, report_editor, viewer
...
...
...
Client Epoll - with the following permissions: client_access, client_editor, viewer
Client Mercury - with the following permissions: client_access, client_editor, viewer
	 Project 2134B Stemac Phase II -- All data - with the following permissions: project_access, project_admin, project_editor, viewer
		 Report Final Questionnaire - with the following permissions: report_admin, report_editor, viewer
		 Report Survey Results - with the following permissions: report_admin, report_editor, viewer
	 Project 2197 2012 Presidential Campaign AD Test - with the following permissions: project_access, project_admin, project_editor, viewer
		 Report Obama dial-test results "The Choice" - with the following permissions: report_admin, report_editor, viewer
		 Report Romney dial-test results "The Plan" - with the following permissions: report_admin, report_editor, viewer
	 Project 1170 (iMod 7497) NC Dial-Test - with the following permissions: project_access, project_admin, project_editor, viewer
		 Report NC 7497 Kristy - with the following permissions: report_admin, report_editor, viewer
		 Report NC 7497 Melissa - with the following permissions: report_admin, report_editor, viewer
		 Report NC 7497 Amily - with the following permissions: report_admin, report_editor, viewer
		 Report NC7497 Yes on Marriage - with the following permissions: report_admin, report_editor, viewer
	 Project 1172 (iMod 7507) America's Voice Radio AD Test - with the following permissions: project_access, project_admin, project_editor, viewer
		 Report C. Roadmap to Citizenzip Solutions - with the following permissions: report_admin, report_editor, viewer
		 Report D. People Move - with the following permissions: report_admin, report_editor, viewer
		 Report J. Define America - with the following permissions: report_admin, report_editor, viewer
		 Report H. New Americans - with the following permissions: report_admin, report_editor, viewer
		 Report E. Injustice is Impractical - with the following permissions: report_admin, report_editor, viewer
		 Report I. Dignity of Work - with the following permissions: report_admin, report_editor, viewer
		 Report G. Not Your Economic Problem - with the following permissions: report_admin, report_editor, viewer
		 Report A. Opposition Illegal Aliens - with the following permissions: report_admin, report_editor, viewer
		 Report B. American Children of Immigrant Parents - with the following permissions: report_admin, report_editor, viewer
		 Report F. 21st Century Underground Railroad Citizenship Rights - with the following permissions: report_admin, report_editor, viewer
Orphan projects
	 Project 3450 2020 192392 Caucus Dial Testing - client 2020 with the following permissions: viewer
		 Report Dial Test Results for "3450_2020_Paycheck" - with the following permissions: viewer
Orphan reports
		 Report Dial Test Results for "2871_2020_Opening_Doors" - project 2020 Redfin [Opening Doors] client 2020 with the following permissions: viewer
```

# sync users with auth0
`bundle exec rake import:synchronize_auth`


# Add new dynamic scope
In order to add a new dynamic scope, you'll need to run the following rake task:
`bundle exec rake scopes:create:dynamic -- --action=do_something --scope=projects --description="small description of the scope" --name scope_name`

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
