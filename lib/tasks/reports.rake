namespace :reports do
  desc 'generates the partner client csv'
  task partner_clients: :environment do
    require 'csv'

    puts 'generating the partner clients list csv'

    filename = "report-partner-#{Time.zone.now.strftime('%H-%M-%d-%m')}.csv"
    CSV.open("#{Rails.root}/public/#{filename}", "wb") do |csv|
      csv << ['Client ID', 'Client name', 'Client subdomain']

      Client.where(contact_type: Client::PARTNER).find_each do |client|
        csv << [client.id, client.name, client.subdomain]
      end
    end

    puts "Generated the file in public/#{filename}"
  end

  task duplicate_accounts: :environment do
    require 'optparse'
    require 'csv'

    filename = "report-client-accounts-on-petasos-#{Time.zone.now.strftime('%H-%M-%d-%m')}.csv"

    options = {
      database_name:     nil,
      database_host:     nil,
      database_user:     nil,
      database_password: nil
    }

    o        = OptParse.new
    o.banner = 'Usage: rake import OPTIONS'
    o.on('--db-name', '--db-name=DATABASE_NAME') { |input| options[:database_name] = input }
    o.on('--db-host', '--db-host=DATABASE_HOST') { |input| options[:database_host] = input }
    o.on('--db-pass', '--db-pass=DATABASE_PASSWORD') { |input| options[:database_password] = input }
    o.on('--db-user', '--db-user=DATABASE_USER') { |input| options[:database_user] = input }
    o.parse!(o.order(ARGV) {})

    db_client = Mysql2::Client.new(
      host:     options[:database_host],
      username: options[:database_user],
      password: options[:database_password],
      database: options[:database_name]
    )

    duplicate_users = db_client.query('select LOWER(contact_email) as email, count(*) from accounts group by LOWER(contact_email) having count(*) > 1')

    users = duplicate_users.collect do |result|
      user_result = db_client.query("SELECT * FROM accounts WHERE LOWER(contact_email) = LOWER('#{result['email']}')")

      v = user_result.to_a.collect { |d| d.except('crypted_password', 'salt', 'persistence_token', 'remember_token', 'remember_token_expires_at', 'login_at') }
      v.each do |user|
        user['domain_id'] = db_client.query("SELECT name FROM domains WHERE id = #{user['domain_id']}").to_a.first['name']
      end
    end

    CSV.open("#{Rails.root}/public/#{filename}", "wb") do |csv|
      csv << users.flatten!.first.keys

      users.each { |user| csv << user.values }
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
