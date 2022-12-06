module Users
  class DeleteAuth0User
    include Interactor

    delegate :user, to: :context

    def call
      return unless context.remove_user_from_system
      return unless user.auth_id

      RestClient.delete(URI.encode(endpoint), authorization_header) do |response, _, _|
        context.fail!(message: JSON.parse(response.body)['message']) unless response.code == 204
      end
    end

    def endpoint
      Rails.application.credentials[:auth0][:management_api][:base_url] + 'api/v2/users/' + user.auth_id
    end

    def authorization_header
      {
        'Authorization': "Bearer #{::Auth0::UserManagementToken.call}",
        'Content-Type':  'application/json'
      }
    end
  end
end
