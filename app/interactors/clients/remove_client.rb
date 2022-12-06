module Clients
  class RemoveClient
    include Interactor

    delegate :client, to: :context

    def call
      client.destroy
    end
  end
end
