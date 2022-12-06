module Users
  class SendInvitationToUser
    include Interactor

    delegate :user, :authorization_params, :current_user, :client_id, :no_auth, to: :context

    def call
      return unless client_id.present? || client.present?
      return if context.new_user == 0 && no_auth.to_i == 0

      update_user_forgot_password
      send_invitation_email
    end

    def update_user_forgot_password
      user.password_reset_token      = SecureRandom.hex(16)
      user.password_reset_expires_at = 1.week.from_now
      user.password_reset_domain     = client.partner? ? client.subdomain : nil
      user.save
    end

    def send_invitation_email
      UserMailer.invitation_email(user, client, current_user).deliver_now
    end

    def client
      return context.client if context.client.present?
      return unless client_id

      @client ||= Client.find(client_id)
    end
  end
end
