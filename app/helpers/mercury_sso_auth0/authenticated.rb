# frozen_string_literal: true

module MercurySsoAuth0
  module Authenticated
    def self.included(base)
      base.class_eval do
        before_action :authenticated?
        helper_method :current_user
      end
    end

    def current_user
      @current_user ||= begin
                          userinfo = session[:userinfo]
                          userinfo = nil unless session_valid?
                          MercurySsoAuth0::User.new(userinfo)
                        end
    end

    def session_valid?
      userinfo = session[:userinfo]
      return false unless userinfo.present?

      creds = userinfo[:credentials]
      !creds[:expires] || Time.now < Time.at(creds[:expires_at])
    end

    def authenticated?
      return true if session_valid?

      session[:authentication_intercept] ||= request.fullpath
      redirect_to sso_login.to_s
      false
    end

    def sso_login
      uri = if MercurySsoAuth0.login_port.nil?
              URI::HTTPS.build(host: MercurySsoAuth0.login_url, path: '/login')
            else
              URI::HTTPS.build(
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
