require 'net/http'
require 'uri'

class JsonWebToken
  class << self
    def verify(token)
      JWT.decode(token, nil,
                 true,
                 algorithm: 'RS256',
                 iss: iss,
                 verify_iss: true,
                 aud: audience,
                 verify_aud: false # @TODO check the audience flag; false for the moment so it works
      ) do |header|
        jwks_hash[header['kid']]
      end
    end

    def jwks_hash
      jwks_raw = Net::HTTP.get URI("#{iss}.well-known/jwks.json")
      jwks_keys = Array(JSON.parse(jwks_raw)['keys'])
      Hash[
        jwks_keys
          .map do |k|
          [
            k['kid'],
            OpenSSL::X509::Certificate.new(
              Base64.decode64(k['x5c'].first)
            ).public_key
          ]
        end
      ]
    end

    def iss
      Rails.application.credentials.auth0[:iss]
    end

    def audience
      Rails.application.credentials.auth0[:audience]
    end
  end
end
