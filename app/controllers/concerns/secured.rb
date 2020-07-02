module Secured
  extend ActiveSupport::Concern

  included do
    before_action :authenticate_request!
  end

  private

  def authenticate_request!
    current_user
    auth_token
  rescue JWT::VerificationError, JWT::DecodeError => e
    render json: { errors: ['Not Authenticated'], error_message: e.message }, status: :unauthorized
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

    @current_user = User.find_or_initialize_by(email: email)

    # TODO(@relu): move this piece in other part
    if @current_user.new_record? || @current_user.auth_id.nil?
      @current_user.auth_id = auth_id
      email_domain = email.split('@').last
      client_ids = Domain.where(name: email_domain).pluck(:client_id)
      @current_user.save
      @current_user.memberships << client_ids.map { |client_id| Membership.new(client_id: client_id) } if client_ids.any?
      client_ids.each do |client_id|
        client = Client.find(client_id)
        Authorizations::AddClientDefaultAuthorizations.call(user: @current_user, client: client, no_auth: 1)
      end
    end

    # @current_user.client_scopes = auth_token.first['http://localhost:3001user_authorization']['permissions']
    @current_user
  end
end
