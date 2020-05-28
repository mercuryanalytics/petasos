# Preview all emails at http://localhost:3000/rails/mailers/user_mailer
class UserMailerPreview < ActionMailer::Preview
  def forgot_password_email_preview
    UserMailer.forgot_password_email(User.first, Client.new)
  end
end
