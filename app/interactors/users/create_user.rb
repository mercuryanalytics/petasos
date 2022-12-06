module Users
  class CreateUser
    include Interactor

    delegate :user, to: :context

    def call
      return if user.persisted?

      user.auth_id = context.auth_id

      context.fail!(message: 'Unable to save user') unless user.save
    end

    def rollback
      user.destroy
    end
  end
end
