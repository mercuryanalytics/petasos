class ApplicationMailer < ActionMailer::Base
  default from: "Analytics Workbench <#{Rails.application.credentials[:smtp][:from]}>"
  layout 'mailer'
end
