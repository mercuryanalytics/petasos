module Users
  class CreateUserOrganizer
    include Interactor::Organizer

    organize ValidateUser, CreateAuth0User, CreateUser, AddUserToClient,
             SetAuthorizationType, Authorizations::AddAuthorization, Authorizations::AddClientDefaultAuthorizations,
             SendInvitationToUser, SendResetPasswordToUser
  end
end
