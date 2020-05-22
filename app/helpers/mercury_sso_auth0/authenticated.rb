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

      redirect_to MercurySsoAuth0::Engine.routes.url_helpers.auth_login_path
    end

    def current_user
      session[:userinfo]
    end
  end
end
