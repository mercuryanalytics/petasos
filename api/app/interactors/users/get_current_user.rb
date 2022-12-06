module Users
  class GetCurrentUser
    include Interactor

    delegate :auth_id, :email, :user, to: :context

    def call
      context.user = by_auth_id || by_email ||initialize_new_user

      set_user_auth_id && user.save if user.auth_id.nil? && user.persisted?

      return if user.persisted?

      context.fail!(message: 'No domain found for the given user domain', user: user) unless domain

      user.save

      add_user_to_client(user, domain.client_id)

      add_client_default_authorizations
    end

    private

    def domain
      @domain ||= Domain.find_by(name: user_domain)
    end

    def client
      @client ||= Client.find(domain.client_id)
    end

    def by_auth_id
      User.find_by(auth_id: auth_id)
    end

    def by_email
      User.find_by(email: email)
    end

    def initialize_new_user
      User.new(email: email, auth_id: auth_id)
    end

    def set_user_auth_id
      user.auth_id = auth_id
    end

    def add_user_to_client(user, client_id)
      user.memberships << Membership.new(client_id: client_id)
    end

    def user_domain
      user.email.split('@').last
    end

    def add_client_default_authorizations
      Authorizations::AddClientDefaultAuthorizations.call(user: user, client: client, no_auth: 1)
    end
  end
end
