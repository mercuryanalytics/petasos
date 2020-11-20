# frozen_string_literal: true

module Users
  class CopyUserPermissions
    include Interactor

    delegate :copy_from, :copy_to, :append, to: :context

    def call
      remove_all_memberships unless append
      copy_memberships
    end


    def remove_all_memberships
      memberships = copy_to.memberships
      authorizations = memberships.map(&:authorizations)
      authorization_ids = authorizations.flatten.map(&:id)
      if authorization_ids.any?
        Authorization.connection.execute(
            "DELETE FROM authorizations_scopes WHERE authorization_id IN (#{authorization_ids.join(',')})"
        )
        Authorization.connection.execute("DELETE FROM authorizations WHERE id IN (#{authorization_ids.join(',')})")
      end

      memberships.delete_all
    end

    def copy_memberships
      copy_from.memberships.each do |membership|
        to_membership = Membership.find_or_create_by(client_id: membership.client_id, user_id: copy_to.id)
        membership.authorizations.each do |authorization|
          auth = Authorization.find_or_create_by(
              membership_id: to_membership.id,
              subject_id: authorization.subject_id,
              subject_class: authorization.subject_class
          )

          scopes_ids = authorization.scopes.collect do |scope|
            "(#{auth.id}, #{scope.id})"
          end

          Authorization
              .connection
              .execute("INSERT INTO authorizations_scopes(authorization_id, scope_id) VALUES #{scopes_ids.join(',')}") if scopes_ids.any?
        end
      end
    end
  end
end