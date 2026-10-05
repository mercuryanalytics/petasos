# frozen_string_literal: true

module Authorizations
  class AddClientDefaultAuthorizations
    include Interactor

    delegate :user, :no_auth, :client, to: :context

    def call
      # when adding from super-admin the client is not defined, thus resulting in an orphan user
      return unless client

      # when adding the user from clients -> accounts we send the no_auth parameter to 1
      return unless no_auth.to_i == 1 && client.default_template_enabled

      membership_id = user.memberships.where(client_id: client.id).pick(:id)

      membership_authorizations = client_authorizations.collect do |authorization|
        {
          subject_id: authorization.subject_id,
          subject_class: authorization.subject_class,
          membership_id: membership_id,
          created_at: Time.zone.now,
          updated_at: Time.zone.now
        }
      end

      # subject_class/subject_id are copied from template rows that already passed validation.
      Authorization.insert_all(membership_authorizations) if membership_authorizations.any? # rubocop:disable Rails/SkipsModelValidations

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
      @client_authorizations ||= client.template_authorizations
    end
  end
end
