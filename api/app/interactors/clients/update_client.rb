module Clients
  class UpdateClient
    include Interactor

    delegate :client, to: :context

    def call
      context.fail!(message: client.errors) unless client.save
    end
  end
end
