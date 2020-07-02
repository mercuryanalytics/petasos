module Api
  module V1
    class PasswordResetController < ApplicationController
      def create
        user = User.find_by(email: create_params[:email])

        unless user
          render json: { data: { message: 'done' } }, status: :created
          return
        end

        user.password_reset_token      = SecureRandom.hex(16)
        user.password_reset_expires_at = 1.week.from_now
        user.password_reset_domain     = create_params.fetch(:subdomain, nil)
        user.save

        client = Client.find_or_initialize_by(subdomain: create_params.fetch(:subdomain, SecureRandom.hex(6)))

        UserMailer.forgot_password_email(user, client).deliver_now if user.auth_id&.start_with?('auth0')

        render json: { data: { message: 'done' } }, status: :created
      end

      def update
        user = User.find_by(password_reset_token: update_params[:token])

        unless user
          render json: {
            data: {
              message: 'The user could not be found'
            }
          }, status:   :unprocessable_entity

          return
        end

        if Time.zone.now > user.password_reset_expires_at
          render json: {
            data: {
              message: 'Your token is expired, please generate another one and try again'
            }
          }, status:   :unprocessable_entity

          return
        end

        unless update_params[:password] == update_params[:password_confirmation]
          render json: {
            data: {
              message: 'The passwords are not the same!'
            }
          }, status:   :unprocessable_entity

          return
        end

        interactor = Users::UpdateAuth0User.call(user: user, params: update_params)

        if interactor.success?
          subdomain = user.password_reset_domain
          user.password_reset_expires_at = nil
          user.password_reset_token = nil
          user.password_reset_domain = nil
          user.save

          render json: {
            data: {
              message: 'done',
              subdomain: subdomain
            }
          }, status: :created

          return
        end

        render json: {
          data: {
            message: interactor.message
          }
        }, status: :unprocessable_entity
      end

      private

      def create_params
        params.permit(:email, :subdomain)
      end

      def update_params
        params.permit(:token, :password, :password_confirmation)
      end
    end
  end
end
