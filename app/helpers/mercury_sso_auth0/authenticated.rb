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

      creds = userinfo["credentials"]
      !creds["expires"] || Time.now < Time.at(creds["expires_at"])
    end

    def authenticated?(opt = {})
      return true if session_valid?

      unless opt[:silent]
        session[:authentication_intercept] ||= request.fullpath
        redirect_to sso_login.to_s
      end
      false
    end

    def sso_login
      return_uri = URI(MercurySsoAuth0.application_origin) + MercurySsoAuth0::Engine.routes.url_helpers.auth_auth0_callback_path
      options = {
        return_url: return_uri.to_s,
        state: state
      }

      uri = URI(MercurySsoAuth0.login_url) + "/login"
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
