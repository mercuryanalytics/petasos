module Api
  module V1
    class PasswordResetController < ApplicationController
      def create
        user = User.find_by(email: create_params[:email])

        unless user
          render json: { data: { message: 'done' } }, status: :created
          return
        end

        if user.auth_id.nil?
          auth0_user_interactor = Users::GetAuth0User.call(email: create_params[:email])
          auth_id = if auth0_user_interactor.success?
                      auth0_user_interactor.auth_id
                    else
                      Users::CreateAuth0User.call(params: { email: user.email }).auth_id
                    end

          user.auth_id = auth_id
          user.save
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

      def verify
        sleep(1.seconds) # to be removed

        user = User.find_by(password_reset_token: verify_params[:token])

        unless user
          render json: {
            data: {
              message: 'Invalid token'
            }
          }, status: :not_found

          return
        end

        if Time.zone.now > user.password_reset_expires_at
          render json: {
            data: {
              message: 'Token expired'
            }
          }, status: :expectation_failed

          return
        end
      end

      def resend
        user = User.find_by(password_reset_token: resend_params[:token]) if resend_params[:token]
        user = User.find_by(email: resend_params[:email]) if !user && resend_params[:email]

        unless user
          render json: { data: { message: 'Invalid request' } }, status: :not_found
          return
        end

        user.password_reset_token      = SecureRandom.hex(16)
        user.password_reset_expires_at = 1.week.from_now
        user.save

        client = Client.find_or_initialize_by(subdomain: user.password_reset_domain)

        UserMailer.forgot_password_email(user, client).deliver_now

        render json: { data: { message: 'done' } }, status: :created
      end

      private

      def create_params
        params.permit(:email, :subdomain)
      end

      def update_params
        params.permit(:token, :password, :password_confirmation)
      end

      def verify_params
        params.permit(:token)
      end

      def resend_params
        params.permit(:token, :email)
      end
    end
  end
end
