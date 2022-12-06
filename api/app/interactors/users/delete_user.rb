module Users
  class DeleteUser
    include Interactor

    delegate :user, to: :context

    def call
      return unless context.remove_user_from_system

      user.destroy
    end
  end
end
