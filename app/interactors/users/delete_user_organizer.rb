module Users
  class DeleteUserOrganizer
    include Interactor::Organizer

    organize CheckUserMembership, DeleteAuth0User, DeleteUser
  end
end
