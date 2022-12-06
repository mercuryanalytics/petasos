# frozen_string_literal: true

module Auth0
  class UserManagementToken
    MANAGEMENT_API_TOKEN = 'management_api_token'

    def self.call
      new.token
    end

    def token
      cache_token { generate_token }
    end

    private

    def cache_token
      cached_token = Rails.cache.read(MANAGEMENT_API_TOKEN)
      return cached_token if cached_token

      if block_given?
        access_token, expires_in = yield
        Rails.cache.write(MANAGEMENT_API_TOKEN, access_token, expires_in: expires_in - 1)

        access_token
      end
    end

    def generate_token
      response = RestClient.post(auth_url, client_credentials)

      if response.code == 200
        body = JSON.parse(response.body)
        return [body['access_token'], body['expires_in']]
      end

      raise StandardError, "endpoint responded with #{response.code}; response body: #{response.body}"
    end

    def client_credentials
      {
        client_id:     Rails.application.credentials[:auth0][:management_api][:client_id],
        client_secret: Rails.application.credentials[:auth0][:management_api][:client_secret],
        audience:      Rails.application.credentials[:auth0][:management_api][:audience],
        grant_type:    "client_credentials"
      }
    end

    def auth_url
      "#{Rails.application.credentials[:auth0][:management_api][:base_url]}oauth/token"
    end
  end
end
