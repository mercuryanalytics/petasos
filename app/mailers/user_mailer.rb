class UserMailer < ApplicationMailer

  def forgot_password_email(user, client)
    @user   = user
    @client = client

    parsed_url = URI.parse(Rails.application.credentials[:app_host])
    @link      = if @user.password_reset_domain.present?
                   "#{parsed_url.scheme}://#{@user.password_reset_domain}.#{parsed_url.hostname}/password-reset?token=#{@user.password_reset_token}"
                 else
                   "#{parsed_url.scheme}://#{parsed_url.hostname}/password-reset?token=#{@user.password_reset_token}"
                 end

    mail(to: @user.email, subject: 'Reset your password')
  end

  def invitation_email(user, client, inviter)
    @user = user
    @client = client
    @inviter_user = inviter

    parsed_url = URI.parse(Rails.application.credentials[:app_host])
    @forgot_password_url = if @client.partner? && @client.subdomain
                             "#{parsed_url.scheme}://#{@client.subdomain}.#{parsed_url.hostname}/password-reset?token=#{@user.password_reset_token}"
                           else
                             "#{parsed_url.scheme}://#{parsed_url.hostname}/password-reset?token=#{@user.password_reset_token}"
                           end

    @link = if @client.partner? && @client.subdomain
              "#{parsed_url.scheme}://#{@client.subdomain}.#{parsed_url.hostname}"
            else
              "#{parsed_url.scheme}://#{parsed_url.hostname}"
            end

    mail(to: @user.email, subject: "You have been invited to join #{@client.name}")
  end
end
