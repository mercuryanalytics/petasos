require 'omniauth'
require 'omniauth-auth0'
require 'rest-client'

module MercurySsoAuth0
  class Engine < ::Rails::Engine
    isolate_namespace MercurySsoAuth0

    middleware.use ::OmniAuth::Builder do
      provider(
        :auth0,
        MercurySsoAuth0.client,
        MercurySsoAuth0.secret,
        MercurySsoAuth0.domain,
        callback_path: '/auth/auth0/callback',
        authorize_params: {
          scope: MercurySsoAuth0.scopes
        }
      )
    end

    initializer 'mercury_sso_auth0' do |app|
      app.routes.append do
        mount MercurySsoAuth0::Engine, at: '/', as: 'auth'
      end
    end

  end
end
