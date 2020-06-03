require "mercury_sso_auth0/engine"

module MercurySsoAuth0

  # Auth0 Client ID
  mattr_accessor :client
  @@client = nil

  # Auth0 Client secret
  mattr_accessor :secret
  @@secret = nil

  # Auth0 Client domain
  mattr_accessor :domain
  @@domain = nil

  # Auth0 requested scopes
  mattr_accessor :scopes
  @@scopes = 'openid email profile'

  # RAM login url
  mattr_accessor :login_url
  @@login_url = nil

  # RAM login host port
  mattr_accessor :login_port
  @@login_port = 3004

  # Ram api url
  mattr_accessor :api_url
  @@api_url = 'http://localhost:3002'

  # Host setup
  mattr_accessor :host
  @@host = 'localhost'

  def self.setup
    yield self
  end
end
