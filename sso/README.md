# MercurySsoAuth0
Short description and motivation.

## Usage

Create an initializer in your app add set the following values:
```ruby
MercurySsoAuth0.setup do |ma|
  ma.client    = 'AUTH0_CLIENT_ID'
  ma.secret    = 'AUTH0_CLIENT_SECRET'
  ma.domain    = 'AUTH0_DOMAIN'
  ma.login_url = 'BASE_URL FOR FRONTEND RAM APP'
  ma.api_url   = 'API_BASE_URL'
  # this will be app url which also needs to be in auth0 authorized callbacks
  # in auth0 authorized callbacks, the URL must also contain `auth/auth0/callback` path
  ma.host      = 'https://domain.tld' 
                  
end
```

Include the following in your protected controllers:
```
class ProtectedControllerBase < ApplicationController
  include MercurySsoAuth0::Authenticated
end
```


Defined methods:
* `current_user` returns the current authenticated user as a `MercurySsoAuth0::User` instance
* `MercurySsoAuth0::User#email` -  returns the email
* `MercurySsoAuth0::User#scopes(session || {})`
    * sends a GET request to RAM Api and saves the returned scopes in session or a simple hash or a hash structure of your choice (you can also cache it through Rails.cache)
    * you can use this in your cancancan ability files to assign permissions
    * in order to not call the api again, you can save the scopes in session or a hash structure

Sample of scopes you can get:
```
{
    "data": {
        "project": [
            [
                {
                    "id": 175148,
                    "subject_class": "Project",
                    "subject_id": 1366
                },
                [
                    "viewer"
                ],
                [
                    {
                        "id": 53,
                        "scope": "projects",
                        "action": "do",
                        "description": "Some description",
                        "created_at": "2020-12-03T09:53:38.761Z",
                        "updated_at": "2020-12-03T09:53:38.761Z",
                        "global": false,
                        "dynamic": true,
                        "name": "scopeNameProj"
                    }
                ]
            ],
            [
                {
                    "id": 158006,
                    "subject_class": "Project",
                    "subject_id": 436
                },
                [
                    "viewer"
                ],
                []
            ]
        ],
        "report": [
            [
                {
                    "id": 175146,
                    "subject_class": "Report",
                    "subject_id": 5860
                },
                [
                    "viewer"
                ],
                [
                    {
                        "id": 51,
                        "scope": "reports",
                        "action": "do",
                        "description": "Some description",
                        "created_at": "2020-12-03T08:47:48.761Z",
                        "updated_at": "2020-12-03T08:47:48.761Z",
                        "global": false,
                        "dynamic": true,
                        "name": "scopeName"
                    }
                ]
            ]
        ],
        "client": [
            [
                {
                    "id": 158098,
                    "subject_class": "Client",
                    "subject_id": 147
                },
                [
                    "viewer"
                ],
                []
            ],
            [
                {
                    "id": 157673,
                    "subject_class": "Client",
                    "subject_id": 153
                },
                [
                    "viewer"
                ],
                []
            ],
            [
                {
                    "id": 157715,
                    "subject_class": "Client",
                    "subject_id": 53
                },
                [
                    "viewer"
                ],
                []
            ]
        ],
        "global": [
            {
                "id": 44,
                "scope": "admin",
                "action": "admin",
                "description": "Global admin",
                "created_at": "2020-11-06T10:26:48.046Z",
                "updated_at": "2020-11-06T10:26:48.046Z",
                "global": true,
                "dynamic": false,
                "name": "Mercury Analytics Admin"
            },
            {
                "id": 45,
                "scope": "user",
                "action": "research",
                "description": "Research project",
                "created_at": "2020-11-06T10:26:48.050Z",
                "updated_at": "2020-11-06T10:26:48.050Z",
                "global": true,
                "dynamic": false,
                "name": "Researcher"
            }
        ],
        "dynamic": [
            {
                "id": 51,
                "scope": "reports",
                "action": "do",
                "description": "Some description",
                "created_at": "2020-12-03T08:47:48.761Z",
                "updated_at": "2020-12-03T08:47:48.761Z",
                "global": false,
                "dynamic": true,
                "name": "scopeName"
            },
            {
                "id": 53,
                "scope": "projects",
                "action": "do",
                "description": "Some description",
                "created_at": "2020-12-03T09:53:38.761Z",
                "updated_at": "2020-12-03T09:53:38.761Z",
                "global": false,
                "dynamic": true,
                "name": "scopeNameProj"
            },
            {
                "id": 53,
                "scope": "projects",
                "action": "do",
                "description": "Some description",
                "created_at": "2020-12-03T09:53:38.761Z",
                "updated_at": "2020-12-03T09:53:38.761Z",
                "global": false,
                "dynamic": true,
                "name": "scopeNameProj"
            }
        ]
    }
}
```

You can use the `dynamic` key to set your cancan abilities. A sample file would be

Notes: 
* The format of the response is the following:
```
{
"data": {
    "DIMENSION": [
        authorization_as_json, 
        [ram access - viewer, DIMENSIOΩN_access, DIMENSION_admin, DIMENSION_editor],
        [Dynamic Scopes for this authorization]
    ],
    "global": [array of global scopes for this user],
    "dynamic": [array of dynamic scopes]
}

}
```

* Current dimensions are: `project, report, client`
* If you need to check if a user has access to a specific report, you can iterate through the "DIMENSION" - look at the example of `sample of scopes`

* user_ability.rb
```
class UserAbility
  include CanCan::Ability

  attr_reader :user

  def initialize(user, session)
    @user = user
    
    # setting the admin
    can :manage, :all if @user.scopes(session)['data']['global'].any? { |permission| permission['action'] == 'admin' }

    # Setting the dynamic access
    @user.scopes(session)['data']['dynamic'].each do |permission|
       can permission['action'].to_sym, Model
    end
  end
end
```

* users_controller.rb
```
class UsersController < ApplicationController

  def index
    can? :permission_name, User
  end

  def current_ability
    UserAbility.new(current_user, session)
  end
end
```

# Generating scopes
## Generating dynamic scopes
Use the following rake task in the RAM api to generate new dynamic scopes

`bundle exec rake scopes:create -- --action do --scope reports --description \"Some description\" --name name`

OR use the following SQL query

`INSERT INTO scopes(scope, action, description, dynamic, name, created_at, updated_at) VALUES('reports', 'doSomething', 'Some description of your new scope', true, 'Primary name', NOW(), NOW());`

This will create a new scope scope which will be added as a checkbox under Report tab in RAM SuperAdmin, in which you can enable / disable it.
Note: for dynamic scopes, in order for them to appear in the RAM UI, its scope must be one of `clients, reports, projects`

## Generating global scopes
You can use the following query to generate a global scope:

`INSERT INTO scopes(scope, action, description, global, name, created_at, updated_at) VALUES('admin', 'doSomething', 'Some description of your new scope', true, 'Primary name', NOW(), NOW());`
 
## Installation
Add this line to your application's Gemfile:

```ruby
gem 'mercury_sso_auth0'
```

And then execute:
```bash
$ bundle
```

Or install it yourself as:
```bash
$ gem install mercury_sso_auth0
```

## Contributing
Contribution directions go here.

## License
The gem is available as open source under the terms of the [MIT License](https://opensource.org/licenses/MIT).
