module Api
  module V1
    class ScopesController < BaseController
      include Secured

      def index
        json_response([]) && return unless current_user.admin?

        response = {
          global:  Scope.global,
          dynamic: Scope.dynamic
        }

        json_response(response)
      end
    end
  end
end
