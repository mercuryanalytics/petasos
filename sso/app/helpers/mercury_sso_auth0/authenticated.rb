# frozen_string_literal: true

module MercurySsoAuth0
  module Authenticated
    def self.included(base)
      base.class_eval do
        before_action :authenticated?
        helper_method :current_user, :session_valid?, :session_expires_at
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

      expires_at = session_expires_at
      return Time.now < expires_at if expires_at

      # Legacy fallback for consumers that haven't configured
      # MercurySsoAuth0.session_lifetime yet. The access-token `expires_at`
      # tracks the OAuth access token, not the real session, so this can
      # under- or over-state validity. New consumers should set
      # session_lifetime to opt into truthful expiry.
      creds = userinfo["credentials"]
      !creds["expires"] || Time.now < Time.at(creds["expires_at"])
    end

    # When the Auth0 session will actually require the user to re-authenticate,
    # computed as auth_time (from the id_token captured at callback) plus the
    # configured MercurySsoAuth0.session_lifetime. Returns nil if either piece
    # is missing — callers (e.g. a "session about to expire" warning) should
    # treat nil as "expiry unknown" rather than assume immediate expiry.
    def session_expires_at
      userinfo = session[:userinfo]
      return nil unless userinfo.present?

      auth_time = userinfo["auth_time"]
      lifetime = MercurySsoAuth0.session_lifetime
      return nil unless auth_time && lifetime

      Time.at(auth_time) + lifetime
    end

    def authenticated?(opt = {})
      return true if session_valid?

      if opt.fetch(:prompt, true)
        session[:authentication_intercept] ||= request.fullpath
        redirect_to sso_login.to_s, allow_other_host: true
      else
        head :unauthorized
      end

      false
    end

    def sso_login
      return_uri = URI(MercurySsoAuth0.application_origin) + MercurySsoAuth0::Engine.routes.url_helpers.auth_auth0_callback_path
      options = {
        return_url: return_uri.to_s,
        state: state
      }

      uri = URI(MercurySsoAuth0.login_url) + "/login#"
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
