module Users
  class GetAuth0User
    include Interactor

    delegate :email, to: :context

    def call
      RestClient.get(users_endpoint, authorization_header) do |response, _, _|
        r = JSON.parse(response.body)

        context.fail!(message: 'not_exists') if r.empty?

        context.auth_id = r.first.fetch('user_id')
      end
    end

    def authorization_header
      {
        'Authorization': "Bearer #{::Auth0::UserManagementToken.call}",
        'Content-Type':  'application/json'
      }
    end

    def users_endpoint
      Rails.application.credentials[:auth0][:management_api][:base_url] + "api/v2/users-by-email?email=#{CGI.escape(email)}"
    end
  end
end
