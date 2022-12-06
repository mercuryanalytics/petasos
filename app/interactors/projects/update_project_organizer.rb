module Projects
  class UpdateProjectOrganizer
    include Interactor::Organizer

    organize ValidateProject, UpdateProject
  end
end
