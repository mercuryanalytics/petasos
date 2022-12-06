module Users
  class UpdateUser
    include Interactor

    delegate :user, to: :context

    def call
      context.fail!(message: 'Could not update the user') unless user.save
    end
  end
end
