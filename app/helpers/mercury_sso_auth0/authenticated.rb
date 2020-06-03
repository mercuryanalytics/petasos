module MercurySsoAuth0
  module Authenticated

    def self.included(base)
      base.class_eval do
        before_action :authenticated?
        helper_method :current_user
      end
    end

    def current_user
      @current_user ||= MercurySsoAuth0::User.new(session[:userinfo])
    end

    def authenticated?
      return true if session[:userinfo].present?

      redirect_to sso_login.to_s
    end

    def sso_login
      uri = if Rails.env.production?
              URI::HTTP.build(host: MercurySsoAuth0.login_url, path: '/login')
            else
              URI::HTTP.build(
                host: MercurySsoAuth0.login_url,
                path: '/login',
                port: MercurySsoAuth0.login_port
              )
            end

      options = {
        return_url: MercurySsoAuth0::Engine.routes.url_helpers.auth_auth0_callback_url(host: MercurySsoAuth0.host),
        state: state
      }

      uri.query = URI.encode_www_form(options)

      uri
    end

    def state
      state = SecureRandom.hex(24)
      session['omniauth.state'] = state
      state
    end
  end
end
