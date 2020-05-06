module Users
  class UpdateUserOrganizer
    include Interactor::Organizer

    organize ValidateUser, UpdateAuth0User, UpdateUser
  end
end
