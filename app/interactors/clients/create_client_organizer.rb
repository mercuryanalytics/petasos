module Clients
  class CreateClientOrganizer
    include Interactor::Organizer

    organize ValidateClient, CreateClient, Authorizations::AddAuthorization
  end
end
