module MercurySsoAuth0
  class User
    attr_reader :attributes

    def initialize(attributes)
      @attributes = attributes
    end

    def email
      attributes['info']['email']
    end

    DEFAULT_SCOPES = { data: { global: {}, client: {}, report: {}, project: {} } }.to_json
    def scopes(session)
      # return session['scopes'] if session.key?('scopes')

      @response ||= ::RestClient.get(
        MercurySsoAuth0.api_url + '/api/v1/users/me',
        'Authorization': 'Bearer ' + attributes['credentials']['id_token']
      ) do |response|
        body = response.body
        body = DEFAULT_SCOPES if body.empty?
        JSON.parse(body)
      end

      # session['scopes'] = response
    end
  end
end
