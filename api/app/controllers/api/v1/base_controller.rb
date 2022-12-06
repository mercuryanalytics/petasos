module Api
  module V1
    class BaseController < ApplicationController
      include Secured

      rescue_from CanCan::AccessDenied do
        render json: { errors: 'You are not authorized' }, status: :unauthorized
      end

      rescue_from ActiveRecord::RecordInvalid do |error|
        render json: { errors: error }, status: :unprocessable_entity
      end

      def json_response(body, status = :ok)
        render json: { data: body }, status: status
      end

      def error_response(errors)
        render json: { errors: errors }, status: :unprocessable_entity
      end
    end
  end
end
