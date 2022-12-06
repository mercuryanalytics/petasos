module MercurySsoAuth0
  class User
    attr_reader :attributes

    def initialize(attributes)
      @attributes = attributes
    end

    def email
      attributes['info']['email']
    end

    def to_owner
      email
    end

    def to_s
      email
    end

    DEFAULT_SCOPES = { data: { global: {}, client: {}, report: {}, project: {} } }.with_indifferent_access.freeze
    def scopes(_session)
      # return session['scopes'] if session.key?('scopes')

      return DEFAULT_SCOPES unless attributes.present?

      @scopes ||= ::RestClient.get(
        (URI(MercurySsoAuth0.api_url) + '/api/v1/users/me').to_s,
        Authorization: 'Bearer ' + attributes['credentials']['id_token']
      ) do |response|
        body = response.body
        body = DEFAULT_SCOPES.to_json if body.empty?
        JSON.parse(body)
      end

      # session['scopes'] = response
    end
  end
end
