module Authorizations
  class AddClientDefaultAuthorizations
    include Interactor

    delegate :user, :no_auth, :client, to: :context

    def call
      # when adding from super-admin the client is not defined, thus resulting in an orphan user
      return unless client

      # when adding the user from clients -> accounts we send the no_auth parameter to 1
      return unless no_auth.to_i == 1 && client.default_template_enabled

      membership_id = user.memberships.where(client_id: client.id).pluck(:id).first

      membership_authorizations = client_authorizations.collect do |authorization|
        {
          subject_id:    authorization.subject_id,
          subject_class: authorization.subject_class,
          membership_id: membership_id,
          created_at:    Time.zone.now,
          updated_at:    Time.zone.now
        }
      end

      Authorization.insert_all(membership_authorizations) if membership_authorizations.any?

      client_authorizations.each do |client_authorization|
        user_authorization = Authorization.find_by(
          membership_id: membership_id,
          subject_class: client_authorization.subject_class, subject_id: client_authorization.subject_id
        )

        user_authorization.scopes = client_authorization.scopes if user_authorization
      end
    end

    private

    def client_authorizations
      @client_authorizations ||= client.authorizations
    end
  end
end
