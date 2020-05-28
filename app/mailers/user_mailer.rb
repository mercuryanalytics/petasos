class UserMailer < ApplicationMailer

  def forgot_password_email(user, client)
    @user   = user
    @client = client

    parsed_url = URI.parse(Rails.application.credentials[:app_host])
    @link      = if @user.password_reset_domain.present?
                   "#{parsed_url.scheme}://#{@user.password_reset_domain}.#{parsed_url.hostname.delete_prefix('www.')}/password-reset?token=#{@user.password_reset_token}"
                 else
                   "#{parsed_url.scheme}://#{parsed_url.hostname.delete_prefix('www.')}/password-reset?token=#{@user.password_reset_token}"
                 end

    mail(to: @user.email, subject: 'Reset your password')
  end
end
