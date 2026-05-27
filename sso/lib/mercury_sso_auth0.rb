# frozen_string_literal: true

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

  # Ram api url
  mattr_accessor :api_url
  @@api_url = 'http://localhost:3002'

  # Host setup
  mattr_accessor :application_origin
  @@application_origin = 'http://localhost'

  # Optional callback path override
  mattr_accessor :callback_path
  @@callback_path = '/auth/auth0/callback'

  # Maximum session lifetime as an ActiveSupport::Duration.
  # Must match the Auth0 tenant's Max Session Lifetime so that
  # `session_expires_at` reflects when Auth0 will actually require
  # the user to re-authenticate.
  mattr_accessor :session_lifetime
  @@session_lifetime = nil

  def self.setup
    yield self
  end
end
