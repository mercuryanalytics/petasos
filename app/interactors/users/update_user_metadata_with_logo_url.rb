module Users
  class UpdateUserMetadataWithLogoUrl
    include Interactor
    include ActionView::Helpers::AssetUrlHelper

    delegate :user, :no_auth, :client_id, :client, to: :context

    def call
      return if client_id.present? || client.present?
      return if context.new_user == 0 && no_auth.to_i == 1

      update_user_metadata
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

    def user_metadata
      {
        user_metadata: {
          logo_url: logo_url,
          base_url: Rails.application.credentials[:app_host]
        }
      }
    end

    def logo_url
      parsed_url = URI.parse(Rails.application.credentials[:app_host])

      image_url(
        'mercury-analytics-logo.png',
        host: "#{parsed_url.scheme}://api.#{parsed_url.hostname.delete_prefix('www.')}"
      )
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
