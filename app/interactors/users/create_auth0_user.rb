# frozen_string_literal: true

module Users
  class CreateAuth0User
    include Interactor

    AUTH0_CONNECTION_TYPE = 'Username-Password-Authentication'

    delegate :params, :user, to: :context

    def call
      return if user && user.persisted?

      RestClient.post(users_endpoint, create_params, authorization_header) do |response, _, _|
        context.fail!(message: JSON.parse(response.body)['message']) if response.code != 201

        context.auth_id = JSON.parse(response.body)['user_id']
      end
    end

    def create_params
      {
        email:          params[:email],
        password:       params[:password] || SecureRandom.uuid,
        email_verified: true,
        connection:     AUTH0_CONNECTION_TYPE
      }
    end

    def authorization_header
      {
        'Authorization': "Bearer #{::Auth0::UserManagementToken.call}",
        'Content-Type':  'application/json'
      }
    end

    def users_endpoint
      Rails.application.credentials[:auth0][:management_api][:base_url] + 'api/v2/users'
    end

    def rollback
      DeleteAuth0User.call(user: user, remove_user_from_system: true)
    end
  end
end
