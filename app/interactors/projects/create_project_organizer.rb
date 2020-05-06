module Projects
  class CreateProjectOrganizer
    include Interactor::Organizer

    organize ValidateProject, CreateProject, Authorizations::AddAuthorization,
             Authorizations::AddAuthorizationFromParent
  end
end
