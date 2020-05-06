module Clients
  class CreateClient
    include Interactor

    delegate :client, to: :context

    def call
      context.fail!(message: client.errors) unless client.save
    end

    def rollback
      client.destroy
    end
  end
end
