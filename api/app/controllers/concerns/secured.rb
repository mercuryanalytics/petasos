# frozen_string_literal: true

module Secured
  extend ActiveSupport::Concern

  included do
    before_action :authenticate_request!

    rescue_from ::JWT::ExpiredSignature,
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
    return if request.headers['Authorization'].blank?

    request.headers['Authorization'].split.last
  end

  def auth_token
    @auth_token ||= JsonWebToken.verify(http_token)
  end

  def current_user
    email = auth_token.first['email']
    auth_id = auth_token.first['sub']

    interactor = Users::GetCurrentUser.call(email: email, auth_id: auth_id)

    raise UserNotFoundError, interactor.message unless interactor.success?

    @current_user = interactor.user
  end
end
