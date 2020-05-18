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

  def self.setup
    yield self
  end
end
