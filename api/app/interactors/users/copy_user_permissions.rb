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
      copy_to.memberships.destroy_all
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

          auth.scopes << authorization.scopes
        end
      end
    end
  end
end
