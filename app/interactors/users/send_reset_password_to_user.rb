module Users
  class SendResetPasswordToUser
    include Interactor

    AUTH0_CONNECTION_TYPE = 'Username-Password-Authentication'

    delegate :user, :no_auth, :client_id, :client, to: :context

    def call
      return if client_id.present? || client.present?
      return if context.new_user == 0 && no_auth.to_i == 1

      user.password_reset_token      = SecureRandom.hex(16)
      user.password_reset_expires_at = 1.week.from_now
      user.password_reset_domain     = nil
      user.save

      UserMailer.forgot_password_email(user, Client.new).deliver_now
    end

    private

    def payload
      {
        client_id:  Rails.application.credentials[:auth0][:management_api][:client_id],
        email:      user.email,
        connection: AUTH0_CONNECTION_TYPE
      }
    end

    def authorization_header
      {
        'Authorization': "Bearer #{::Auth0::UserManagementToken.call}",
        'Content-Type':  'application/json'
      }
    end

    def reset_password_endpoint
      Rails.application.credentials[:auth0][:management_api][:base_url] + 'dbconnections/change_password'
    end
  end
end
