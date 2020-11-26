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
    * sends a GET request to RAM Api and saves the returned scopes in session or a simple hash or a hash structure of your choice
    * you can use this in your cancancan ability files to assign permissions
    * in order to not call the api again, you can save the scopes in session or a hash structure

Sample of scopes you can get:
```
{
    "data": {
        "global": [
            {
                "id": 44,
                "scope": "admin",
                "action": "admin",
                "description": "Global admin",
                "created_at": "2020-06-29T12:29:34.645Z",
                "updated_at": "2020-06-29T12:29:34.645Z",
                "global": true,
                "dynamic": false,
                "name": "Mercury Analytics Admin"
            }
        ],
        "dynamic": [
            {
                "id": 47,
                "scope": "projects",
                "action": "financial_access",
                "description": "Financial access scope",
                "created_at": "2020-06-29T12:29:34.655Z",
                "updated_at": "2020-06-29T12:29:34.655Z",
                "global": false,
                "dynamic": true,
                "name": "Financial Manager"
            },
            {
                "id": 48,
                "scope": "reports",
                "action": "view_report",
                "description": "Report dynamic permission",
                "created_at": "2020-06-29T12:29:34.658Z",
                "updated_at": "2020-06-29T12:29:34.658Z",
                "global": false,
                "dynamic": true,
                "name": "Report viewer"
            }
        ]
    }
}
```

You can use the `dynamic` key to set your cancan abilities. A sample file would be

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
