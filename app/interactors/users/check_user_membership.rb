module Users
  class CheckUserMembership
    include Interactor

    delegate :user, :client_id, to: :context

    def call
      return if context.remove_user_from_system

      context.remove_user_from_system = single_membership?

      remove_membership
    end

    private

    def single_membership?
      user.memberships.count <= 1
    end

    def remove_membership
      Membership.where(client_id: client_id, user_id: user.id).destroy_all
    end
  end
end
