module MercurySsoAuth0
  module Authenticated

    def self.included(base)
      base.class_eval do
        before_action :authenticated?
        helper_method :current_user

      end
    end

    def authenticated?
      return true if session[:userinfo].present?

      redirect_to sso_login.to_s
    end

    # @TODO(@relu): refactor these parts for dev / prod usages; use main rails app host to build url
    def sso_login
      uri = URI::HTTP.build(host: MercurySsoAuth0.login_url, path: '/login', port: 3004)
      options = {
        return_url: MercurySsoAuth0::Engine.routes.url_helpers.auth_auth0_callback_url(host: 'http://localhost:3003'),
        state:      state
      }

      uri.query = URI.encode_www_form(options)

      uri
    end

    def state
      state = SecureRandom.hex(24)
      session['omniauth.state'] = state
      state
    end

    def current_user
      session[:userinfo]
    end
  end
end
