module Users
  class SendResetPasswordToUser
    include Interactor

    AUTH0_CONNECTION_TYPE = 'Username-Password-Authentication'

    delegate :user, to: :context

    def call
      RestClient.post(reset_password_endpoint, payload, authorization_header) do |response, _, _|
        context.fail!(message: response.body) if response.code != 200
      end
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
