module Clients
  class CreateClientOrganizer
    include Interactor::Organizer

    organize ValidateClient, CreateClient, CreateClientMembership, Authorizations::AddAuthorization
  end
end
