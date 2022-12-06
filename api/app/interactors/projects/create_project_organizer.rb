module Projects
  class CreateProjectOrganizer
    include Interactor::Organizer

    organize ValidateProject, CreateProject, Authorizations::AddAuthorization
  end
end
