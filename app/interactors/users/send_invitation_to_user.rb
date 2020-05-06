module Users
  class SendInvitationToUser
    include Interactor

    delegate :user, :authorization_params, :current_user, :client_id, :no_auth, to: :context

    def call
      return unless client_id.present? || client.present?
      return if context.new_user == 0 && no_auth.to_i == 0

      update_user_metadata
      send_invitation_email
      clear_user_metadata
    end

    def update_user_metadata
      RestClient.patch(
        URI.encode(endpoint),
        user_metadata,
        authorization_header
      ) do |response, _, _|
        context.fail!(message: JSON.parse(response)['message']) unless response.code == 200
      end
    end

    def clear_user_metadata
      RestClient.patch(
        URI.encode(endpoint),
        { user_metadata: {} }.to_json,
        authorization_header
      ) do |response, _, _|
        context.fail!(message: JSON.parse(response)['message']) unless response.code == 200
      end
    end

    def send_invitation_email
      SendResetPasswordToUser.call(user: user)
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

    def user_metadata
      {
        user_metadata:
          {
            logo_url:   client.logo_url,
            invited_by: current_user.contact_name,
            invited_to: client.name
          }
      }
    end

    def client
      return context.client if context.client.present?
      return unless client_id

      @client ||= Client.find(client_id)
    end
  end
end
