module Secured
  extend ActiveSupport::Concern

  included do
    before_action :authenticate_request!

    rescue_from ::JWT::ExpiredSignature, CanCan::AccessDenied,
                ::JWT::VerificationError,
                ::JWT::DecodeError,
                ::UserNotFoundError,
                with: :render_error

  end

  private

  def render_error
    head :unauthorized
  end

  def authenticate_request!
    auth_token
    current_user
  end

  def http_token
    if request.headers['Authorization'].present?
      request.headers['Authorization'].split(' ').last
    end
  end

  def auth_token
    @auth_token ||= JsonWebToken.verify(http_token)
  end

  def current_user
    email, auth_id = auth_token.first['email'], auth_token.first['sub']

    interactor = Users::GetCurrentUser.call(email: email, auth_id: auth_id)

    raise UserNotFoundError, interactor.message unless interactor.success?

    @current_user = interactor.user
  end
end
