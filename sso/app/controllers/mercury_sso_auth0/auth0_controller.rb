require 'jwt'

module MercurySsoAuth0
  class Auth0Controller < ActionController::Base
    def callback
      auth_hash = request.env['omniauth.auth']
      auth_hash['auth_time'] = extract_auth_time(auth_hash)
      session[:userinfo] = auth_hash

      redirect_to_authentication_intercept
    end

    def failure
      @error_msg = request.params['message'] # TODO: The error case should do something actually useful
    end

    def login; end

    private

    # Pull `auth_time` (when the user actually authenticated, vs. when this
    # id_token was issued during an SSO refresh) out of the id_token. Falls
    # back to `iat` if Auth0 omitted `auth_time`, then to the current time
    # if the id_token is missing or unparseable.
    def extract_auth_time(auth_hash)
      id_token = auth_hash.dig('credentials', 'id_token')
      return Time.now.to_i unless id_token

      payload, _header = JWT.decode(id_token, nil, false)
      payload['auth_time'] || payload['iat'] || Time.now.to_i
    rescue JWT::DecodeError
      Time.now.to_i
    end

    def redirect_to_authentication_intercept
      redirect_to session[:authentication_intercept] if session[:authentication_intercept]
      session[:authentication_intercept] = nil
    end
  end
end
