namespace :reports do
  desc 'generates the partner client csv'
  task partner_clients: :environment do
    require 'csv'

    puts 'generating the partner clients list csv'

    filename = "report-partner-#{Time.zone.now.strftime('%H-%M-%d-%m')}.csv"
    CSV.open("#{Rails.root}/public/#{filename}", "wb") do |csv|
      csv << ['Client name', 'Contact name', 'Contact email']

      Client.where(contact_type: Client::PARTNER).find_each do |client|
        csv << [client.name, client.contact_name, client.contact_email]
      end
    end

    puts "Generated the file in public/#{filename}"
  end

  desc 'generates the client, account, account info'
  task client_accounts: :environment do
    require 'csv'

    filename = "report-client-accounts-#{Time.zone.now.strftime('%H-%M-%d-%m')}.csv"

    needed_values = %w[email company_name contact_name contact_title contact_phone contact_fax contact_email
                      mailing_address_1 mailing_address_2 mailing_city mailing_state mailing_zip mailing_country]

    CSV.open("#{Rails.root}/public/#{filename}", "wb") do |csv|
      csv << ['Client name', *needed_values.map {|i| i.split('_').join(' ')}]

      Client.includes(:users).find_each do |client|
        client.users.each do |user|
          csv << [client.name, *needed_values.map {|i| user.public_send(i)}]
        end
      end
    end

    puts "Generated the file in public/#{filename}"
  end

  desc 'generates researcher report'
  task researchers: :environment do
    require 'csv'

    filename = "report-user-researchers-#{Time.zone.now.strftime('%H-%M-%d-%m')}.csv"

    CSV.open("#{Rails.root}/public/#{filename}", "wb") do |csv|
      require 'csv'

      csv << %w[Name Email]

      User.researchers.find_each do |user|
          csv << [user.contact_name, user.email]
      end
    end

    puts "Generated the file in public/#{filename}"
  end
end
