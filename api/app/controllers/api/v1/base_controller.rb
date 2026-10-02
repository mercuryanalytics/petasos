# frozen_string_literal: true

module Api
  module V1
    class BaseController < ApplicationController
      include Secured

      rescue_from CanCan::AccessDenied do
        render json: { errors: 'You are not authorized' }, status: :forbidden
      end

      rescue_from ActiveRecord::RecordNotFound do
        render json: { errors: 'Not found' }, status: :not_found
      end

      rescue_from ActiveRecord::RecordInvalid do |error|
        render json: { errors: error }, status: :unprocessable_content
      end

      def json_response(body, status = :ok)
        render json: { data: body }, status: status
      end

      def error_response(errors)
        render json: { errors: errors }, status: :unprocessable_content
      end

      private

      # from_admin widens the grant to the user's memberships in every client, so only admins may send it.
      def authorize_params
        permitted = params.permit(:user_id, :client_id, :authorize, :role, :role_state, :scope_id, :scope_state, :from_admin)
        current_user.admin? ? permitted : permitted.except(:from_admin)
      end
    end
  end
end
