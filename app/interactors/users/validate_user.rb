module Users
  class ValidateUser
    include Interactor

    delegate :params, :user, to: :context

    def call
      params[:email].downcase!
      user = context.user || User.find_or_initialize_by(email: params[:email])
      user.assign_attributes(params.except(:password, :client_id))
      user.new_record? ? context.new_user = 1 : context.new_user = 0
      user.valid? ? context.user = user : context.fail!(message: user.errors)
    end
  end
end
