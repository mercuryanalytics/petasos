# frozen_string_literal: true

module Users
  class UpdateAuth0User
    include Interactor

    AUTH0_CONNECTION_TYPE = 'Username-Password-Authentication'

    delegate :user, :params, :current_user, to: :context

    def call
      if user.email_changed? || params.key?(:password)
        RestClient.patch(
          URI.encode(endpoint),
          payload,
          authorization_header
        ) do |response, _, _|
          context.fail!(message: JSON.parse(response)['message']) unless response.code == 200
        end
      end
    end

    def endpoint
      Rails.application.credentials[:auth0][:management_api][:base_url] + 'api/v2/users/' + user.auth_id
    end

    def payload
      payload = {
        connection: AUTH0_CONNECTION_TYPE
      }
      payload.merge!(password: params[:password]) if params[[:password]]
      payload.merge!(email: params[:email]) if current_user.admin? && user.email_changed?

      payload.delete_if { |_, v| v.blank? }
    end

    def authorization_header
      {
        'Authorization': "Bearer #{::Auth0::UserManagementToken.call}",
        'Content-Type':  'application/json'
      }
    end
  end
end
