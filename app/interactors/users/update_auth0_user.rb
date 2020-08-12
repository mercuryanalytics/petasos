# frozen_string_literal: true

module Users
  class UpdateAuth0User
    include Interactor

    AUTH0_CONNECTION_TYPE = 'Username-Password-Authentication'

    delegate :user, :params, :current_user, to: :context

    def call
      if user.email_changed? || params.key?(:password)
        if user.auth_id.present?
          update_user_email
          return
        end

        get_user_interactor = GetAuth0User.call(email: user.email)
        if get_user_interactor.success?
          user.auth_id = get_user_interactor.auth_id
          update_user_email
        else
          create_interactor = CreateAuth0User.call(params: { email: user.email })
          user.auth_id      = create_interactor.auth_id
        end
      end
    end

    def endpoint
      Rails.application.credentials[:auth0][:management_api][:base_url] + 'api/v2/users/' + user.auth_id
    end

    def update_user_email
      RestClient.patch(
        URI.encode(endpoint),
        payload,
        authorization_header
      ) do |response, _, _|
        context.fail!(message: JSON.parse(response)['message']) unless response.code == 200
      end
    end

    def payload
      payload = {
        connection: AUTH0_CONNECTION_TYPE
      }
      payload.merge!(password: params[:password]) if params[:password]
      payload.merge!(email: params[:email]) if current_user&.admin? && user.email_changed?

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
