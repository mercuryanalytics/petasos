module Users
  class UpdateLastLogin

    include Interactor

    delegate :user, to: :context

    def call
      last_login = Time.current

      user.last_login = last_login
      context.last_login = last_login

      context.fail!(message: 'Could not update last login timestamp', user: user) unless user.save
    end

  end
end
