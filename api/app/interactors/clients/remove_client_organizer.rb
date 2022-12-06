module Clients
  class RemoveClientOrganizer
    include Interactor::Organizer

    organize Authorizations::RemoveAuthorization, RemoveClient
  end
end
