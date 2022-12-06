module Clients
  class CreateClientMembership
    include Interactor

    delegate :client, :user, to: :context

    def call
      membership = Membership.find_or_initialize_by(user_id: user.id || user_id, client_id: client.id)

      context.fail!(message: membership.errors) unless membership.save
    end
  end
end
