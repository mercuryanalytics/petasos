# frozen_string_literal: true

module Users
  class ValidateUser
    include Interactor

    delegate :params, :user, to: :context

    def call
      params[:email] = params[:email].downcase if params[:email]
      user = context.user || User.find_or_initialize_by(email: params[:email])
      user.assign_attributes(params.except(:password, :client_id))
      context.new_user = (user.new_record? ? 1 : 0)
      user.valid? ? context.user = user : context.fail!(message: user.errors)
    end
  end
end
