module Projects
  class RemoveProjectOrganizer
    include Interactor::Organizer

    organize Authorizations::RemoveAuthorization, RemoveProject
  end
end
