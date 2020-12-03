module MercurySsoAuth0
  class Auth0Controller < ActionController::Base
    def callback
      session[:userinfo] = request.env['omniauth.auth']

      redirect_to_authentication_intercept
    end

    def failure
      @error_msg = request.params['message']
    end

    def login; end

    private

    def redirect_to_authentication_intercept
      redirect_to session[:authentication_intercept] if session[:authentication_intercept]
      session[:authentication_intercept] = nil
    end
  end
end
