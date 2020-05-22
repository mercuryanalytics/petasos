module MercurySsoAuth0
  class Auth0Controller < ActionController::Base
    def callback
      session[:userinfo] = request.env['omniauth.auth']

      redirect_to '/'
    end

    def failure
      @error_msg = request.params['message']
    end

    def login; end
  end
end
