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
  ma.host      = 'HOSTNAME' # needed for building redirect_uri
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
* `MercurySsoAuth0::User#scopes(session)`
    * sends a GET request to RAM Api and saves the returned scopes in session
    * you can use this in your cancancan ability files to assign permissions

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
