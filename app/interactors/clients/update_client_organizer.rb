module Clients
  class UpdateClientOrganizer
    include Interactor::Organizer

    organize ValidateClient, UpdateClient
  end
end
