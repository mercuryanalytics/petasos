module MercurySsoAuth0
  class User
    attr_reader :attributes

    def initialize(attributes)
      @attributes = attributes
    end

    def email
      attributes['info']['email']
    end

    def scopes(session)
      return session['scopes'] if session.key?('scopes')

      response = ::RestClient.get(
        MercurySsoAuth0.api_url + '/api/v1/users/me',
        'Authorization': 'Bearer ' + attributes['credentials']['id_token']
      ) do |response|
        JSON.parse(response.body)
      end

      session['scopes'] = response
    end
  end
end
