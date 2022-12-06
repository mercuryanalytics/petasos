module Users
  class TriggerResetPassword
    include Interactor

    delegate :user, to: :context

    AUTH0_CONNECTION_TYPE = 'Username-Password-Authentication'

    def call
      return unless user.auth_id.starts_with?('auth0')

      RestClient.post(reset_password_endpoint, payload, authorization_header)
    end

    private

    def authorization_header
      {
          'Authorization': "Bearer #{::Auth0::UserManagementToken.call}",
          'Content-Type':  'application/json'
      }
    end

    def reset_password_endpoint
      Rails.application.credentials[:auth0][:management_api][:base_url] + 'dbconnections/change_password'
    end

    def payload
      {
          client_id: Rails.application.credentials[:auth0][:management_api][:client_id],
          email: user.email,
          connection: AUTH0_CONNECTION_TYPE
      }
    end
  end
end
