require 'optparse'

namespace :import do
  task database_data: :environment do
    require 'open-uri'

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


    client_manager       = Scopes::Role.call(role: Scopes::Role::CLIENT_MANAGER_ROLE).scopes
    client_admin         = Scopes::Role.call(role: Scopes::Role::CLIENT_ADMIN_ROLE).scopes
    project_admin        = Scopes::Role.call(role: Scopes::Role::PROJECT_ADMIN_ROLE).scopes
    project_manager_role = Scopes::Role.call(role: Scopes::Role::PROJECT_MANAGER_ROLE).scopes
    report_admin_role    = Scopes::Role.call(role: Scopes::Role::REPORT_ADMIN_ROLE).scopes
    report_manager       = Scopes::Role.call(role: Scopes::Role::REPORT_MANAGER_ROLE).scopes
    client_access        = Scopes::Role.call(role: Scopes::Role::CLIENT_ACCESS_ROLE).scopes
    project_access_role  = Scopes::Role.call(role: Scopes::Role::PROJECT_ACCESS_ROLE).scopes

    researcher_scope = Scope.find_by(action: 'research', scope: 'user')

    puts 'Migrating domains to companies'
    result = db_client.query('SELECT * FROM domains')

    logo_host = ENV["LOGO_HOST"] || 'http://researchresultswebsite.com/assets/'

    clients_mapped = result.collect do |row|
      client = Client.find_or_initialize_by(name: row['name']).tap do |c|
        c.company_name      = row['company_name']
        c.contact_type      = row['contact_type']
        c.contact_name      = row['contact_name']
        c.contact_title     = row['contact_title']
        c.contact_phone     = row['contact_phone']
        c.contact_fax       = row['contact_fax']
        c.contact_email     = row['contact_email']
        c.mailing_address_1 = row['mailing_address_1']
        c.mailing_address_2 = row['mailing_address_2']
        c.mailing_city      = row['mailing_city']
        c.mailing_state     = row['mailing_state']
        c.mailing_zip       = row['mailing_zip']
        c.mailing_country   = row['mailing_country']

        c.billing_address_1 = row['billing_address_1']
        c.billing_address_2 = row['billing_address_2']
        c.billing_city      = row['billing_city']
        c.billing_state     = row['billing_state']
        c.billing_zip       = row['billing_zip']
        c.billing_country   = row['billing_country']
        c.slogan            = row['slogan']
        c.client_text       = row['client_text']
        c.closing           = row['closing']
        c.homepage          = row['homepage']
        c.subdomain         = get_subdomain(db_client, row['id'])
        c.created_at        = row['created_at']
        c.updated_at        = row['updated_at'] || Time.zone.now

        c.save if c.new_record?

        begin
          unless c.logo.attached?
            c.logo.attach(io: open("#{logo_host}#{row['id']}.png"), filename: "logo-old-client-id-#{row['id']}.png")
            c.save
          end
        rescue OpenURI::HTTPError
          puts "No logo for client #{row['company_name']}"
        end
      end

      {
        new_id: client.id,
        old_id: row['id'],
        name:   client.name
      }
    end

    puts 'migrating users'
    user_results = db_client.query('SELECT * FROM accounts')
    memberships  = []

    admin_scope = Scope.find_by(action: 'admin')

    mapped_users = user_results.collect do |row|
      user = User.find_or_initialize_by(email: row['contact_email'].downcase).tap do |u|
        u.email             = row['contact_email'].downcase
        u.contact_email     = row['contact_email'].downcase
        u.contact_name      = row['contact_name']
        u.company_name      = row['company_name']
        u.contact_title     = row['contact_title']
        u.contact_phone     = row['contact_phone']
        u.contact_fax       = row['contact_fax']
        u.mailing_address_1 = row['mailing_address_1']
        u.mailing_address_2 = row['mailing_address_2']
        u.mailing_city      = row['mailing_city']
        u.mailing_state     = row['mailing_state']
        u.mailing_zip       = row['mailing_zip']
        u.mailing_country   = row['mailing_country']

        u.save
      end

      user.scopes << admin_scope if user.email.split('@').last.downcase == 'mercuryanalytics.com'

      membership = Membership.find_or_initialize_by(
        client_id: get_client(row['domain_id'], clients_mapped),
        user_id:   user.id
      )
      membership.save if membership.new_record?

      client_id = get_client(row['domain_id'], clients_mapped)
      permissions_results = db_client.query("SELECT account_id, GROUP_CONCAT(code, '') as scopes FROM permissions
        WHERE account_id = #{row['id']} GROUP BY account_id;")

      client_auth = Authorization.find_or_initialize_by(
          membership_id: membership.id,
          subject_class: 'Client',
          subject_id: client_id
      )

      client_auth.save if client_auth.new_record?

      permissions_results.each do |row|
        permissions = row['scopes'].split(',')

        if permissions.include?('create_accounts') ||
            permissions.include?('edit_account') ||
            permissions.include?('delete_account') ||
            permissions.include?('create_partner_domain')

          client_auth.client_scopes << client_manager
          client_auth.client_scopes << client_admin
        end
      end

      memberships << membership

      {
        new_id:     user.id,
        old_id:     row['id'],
        belongs_to: row['domain_id'],
        instance:   user
      }
    end

    puts 'Migrating projects'

    projects_results = db_client.query('SELECT * FROM projects')

    mapped_projects = projects_results.collect do |row|
      project = Project.find_or_initialize_by(
        name:           row['name'],
        project_number: row['project_number'],
        domain_id:      row['domain_id']
      ).tap do |p|
        p.name           = row['name']
        p.description    = row['description']
        p.project_number = row['project_number']
        p.domain_id      = get_client(row['domain_id'], clients_mapped)
        p.project_type   = row['project_type']
        p.account_id     = get_user_id(row['account_id'], mapped_users)
        p.modified_on    = row['modified_on']
        p.created_at     = row['created_at']
        p.updated_at     = row['updated_at'] || Time.zone.now
        p.domain_id = Client.find_by(name: 'Mercury Analytics').id if p.domain_id.nil?

        p.save
      end

      {
        new_id:         project.id,
        old_id:         row['id'],
        old_domain_id:  row['domain_id'],
        new_domain_id:  project.domain_id,
        old_account_id: row['account_id']
      }
    end

    puts 'migration reports'

    reports_results = db_client.query('SELECT * FROM reports')

    missing_reports_projects = []
    mapped_reports = reports_results.collect do |row|
      project_row = get_project_row(row['project_id'], mapped_projects)

      begin
        project_id = project_row[:new_id]
        client_id  = project_row[:old_domain_id]
      rescue NoMethodError
        puts "cant find project for #{row.inspect}, assigning to MercuryAnalytics"
        missing_reports_projects << { id: row['id'], name: row['name'], project_id: row['project_id'] }

        cl_id = Client.find_by(name: 'Mercury Analytics').id
        project_id = Project.find_or_create_by(
          name: 'Reports without project form migration', domain_id: cl_id
        ).id

        mapped_projects << {
          old_id: row['project_id'],
          new_id: project_id,
          new_domain_id: cl_id,
          old_domain_id: nil
        }

        client_id = clients_mapped.select { |i| i[:new_id] == cl_id }.first[:old_id]
      end

      report = Report.find_or_initialize_by(name: row['name'], project_id: row['project_id']).tap do |r|
        r.name         = row['name']
        r.url          = row['url']
        r.description  = row['description']
        r.project_id   = project_id
        r.presented_on = row['presented_on']
        r.modified_on  = row['modified_on']
        r.created_at   = row['created_at']
        r.updated_at   = row['updated_at'] || Time.zone.now

        r.save
      end

      client_row = get_client_row(client_id, clients_mapped) || {}
      begin
        old_client_id = client_row.fetch(:old_id, project_row[:old_domain_id])
        new_client_id = client_row.fetch(:new_id, project_row[:new_domain_id])
      rescue NoMethodError
        puts "Cannot find the client for #{row.inspect}, using default MercuryAnalytics client"

        {
          new_id:         report.id,
          old_id:         row['id'],
          old_project_id: row['project_id'],
          new_project_id: report.project_id,
          old_domain_id:  nil,
          new_domain_id:  Client.find_by(name: 'Mercury Analytics').id
        }
      end
      {
        new_id:         report.id,
        old_id:         row['id'],
        old_project_id: row['project_id'],
        new_project_id: report.project_id,
        old_domain_id:  old_client_id,
        new_domain_id:  new_client_id
      }
    end

    puts 'adding project authorizations'

    project_authorizations_results     = db_client.query('SELECT project_accesses.* FROM
      project_accesses INNER JOIN projects ON projects.id = project_accesses.project_id')
    missing_authorizations_project_ids = []

    project_acceses = project_authorizations_results.collect do |row|
      begin
        new_project_row = get_project_row(row['project_id'], mapped_projects)
        new_project_id = new_project_row[:new_id]
        old_client_id = new_project_row[:old_domain_id]
      rescue NoMethodError
        missing_authorizations_project_ids << row['project_id']
        next
      end
      authorization = Authorization.new(
        subject_class: 'Project',
        subject_id:    new_project_id
      ).tap do |auth|
        user = get_user_row(row['account_id'], mapped_users)
        unless user
          puts "skipping #{row.inspect} because the user does not exist"
          next
        end
        client = get_client_row(old_client_id, clients_mapped)

        membership = if client
                       memberships.select { |i| i.client_id == client[:new_id] && i.user_id == user[:new_id] }.first
                     end

        if membership
          auth.membership_id = membership.id
          auth.save

          permissions_results = db_client.query("SELECT account_id, GROUP_CONCAT(code, '') as scopes FROM permissions
        WHERE account_id = #{row['account_id']} GROUP BY account_id;")

          proj = Project.find(new_project_id)

          client_authorization = Authorization.find_or_initialize_by(subject_id: proj.domain_id, subject_class: 'Client', membership_id: membership.id)
          client_authorization.save if client_authorization.new_record?

          permissions_results.each do |row|
            permissions = row['scopes'].split(',')

            if permissions.include?('create_project') ||
                permissions.include?('edit_project') ||
                permissions.include?('delete_project')
              auth.project_scopes << project_manager_role

              if permissions.include?('edit_project_permissions')
                auth.project_scopes << project_admin
              end
            end

            if permissions.include?('view_reports')
              auth.project_scopes << project_access_role
            end
          end
        end
      end

      next if authorization.new_record?

      {
        old_user_id:    row['account_id'],
        old_project_id: row['project_id'],
        new_project_id: new_project_row[:new_id],
        membership_id:  authorization.membership_id,
        authorization:  authorization
      }
    end
    puts "counter for projects #{missing_authorizations_project_ids.size}"

    report_authorizations_results = db_client.query('SELECT report_accesses.* FROM report_accesses INNER JOIN reports ON reports.id = report_accesses.report_id')
    missing_report_authorizations = []

    puts 'adding reports authorizations'

    reports_authorizations = report_authorizations_results.collect do |row|
      new_report_row = get_report_row(row['report_id'], mapped_reports.compact)

      unless new_report_row
        puts "Skipping #{row} since the report could not be found"
        missing_report_authorizations << row['id']
        next
      end

      authorization = Authorization.new(
        subject_class: 'Report',
        subject_id:    new_report_row[:new_id]
      ).tap do |auth|
        user = get_user_row(row['account_id'], mapped_users)

        unless user
          puts "skipping #{row.inspect} because it has nil values"
          next
        end

        client = get_client_row(new_report_row[:old_domain_id], clients_mapped)

        membership = if client
                       memberships.select { |i| i.client_id == client[:new_id] && i.user_id == user[:new_id] }.first
                     end

        if membership
          auth.membership_id = membership.id
          auth.save

          next unless new_report_row[:new_id]
          report = Report.find(new_report_row[:new_id])

          project_authorization = Authorization.find_or_initialize_by(
              subject_class: 'Project',
              subject_id: report.project_id,
              membership_id: membership.id
          )
          project_authorization.save if project_authorization.new_record?

          client_authorization = Authorization.find_or_initialize_by(
              subject_class: 'Client',
              subject_id: report.project.domain_id,
              membership_id: membership.id
          )

          client_authorization.save if client_authorization.new_record?

          permissions_results = db_client.query("SELECT account_id, GROUP_CONCAT(code, '') as scopes FROM permissions
        WHERE account_id = '#{row['account_id']}' GROUP BY account_id;")

          permissions_results.each do |row|
            permissions = row['scopes'].split(',')

            if permissions.include?('edit_report')
              auth.report_scopes << report_manager
              auth.report_scopes << report_admin_role if permissions.include?('edit_report_permissions')
            end
          end
        end
      end


      next if authorization.new_record?
      {
        old_report_id: row['report_id'],
        authorization: authorization
      }
    end
  end

  task client_import: :environment do
    options = {
        database_name:     nil,
        database_host:     nil,
        database_user:     nil,
        database_password: nil,
        client_name: nil
    }

    o        = OptParse.new
    o.banner = 'Usage: rake import OPTIONS'
    o.on('--db-name', '--db-name=DATABASE_NAME') { |input| options[:database_name] = input }
    o.on('--db-host', '--db-host=DATABASE_HOST') { |input| options[:database_host] = input }
    o.on('--db-pass', '--db-pass=DATABASE_PASSWORD') { |input| options[:database_password] = input }
    o.on('--db-user', '--db-user=DATABASE_USER') { |input| options[:database_user] = input }
    o.on('--client-name', '--client-name=CLIENT_NAME') { |input| options[:client_name] = input }
    o.parse!(o.order(ARGV) {})

    db_client = Mysql2::Client.new(
        host:     options[:database_host],
        username: options[:database_user],
        password: options[:database_password],
        database: options[:database_name]
    )

    if options[:client_name].nil?
      puts 'Please input the client name with the --client-name= option'
      exit
    end


    puts 'Checking if the client exists in old db'
    client_result = db_client.query("SELECT * FROM domains WHERE name = '#{options[:client_name]}'")

    unless client_result.any?
      puts "The client was not found in the old db with the provided name #{options[:client_name]}"
      exit
    end

    puts 'Checking if the client is present in the new db'

    c = Client.find_by(name: options[:client_name])
    if c.nil?
      puts 'The client could not be found in the new db; it will be created'
    else
      puts 'The client exists, removing it...'
      c.destroy
      puts 'Client removed, recreating...'
    end


    client_manager       = Scopes::Role.call(role: Scopes::Role::CLIENT_MANAGER_ROLE).scopes
    client_admin         = Scopes::Role.call(role: Scopes::Role::CLIENT_ADMIN_ROLE).scopes
    project_admin        = Scopes::Role.call(role: Scopes::Role::PROJECT_ADMIN_ROLE).scopes
    project_manager_role = Scopes::Role.call(role: Scopes::Role::PROJECT_MANAGER_ROLE).scopes
    report_admin_role    = Scopes::Role.call(role: Scopes::Role::REPORT_ADMIN_ROLE).scopes
    report_manager       = Scopes::Role.call(role: Scopes::Role::REPORT_MANAGER_ROLE).scopes
    client_access        = Scopes::Role.call(role: Scopes::Role::CLIENT_ACCESS_ROLE).scopes
    project_access_role       = Scopes::Role.call(role: Scopes::Role::PROJECT_ACCESS_ROLE).scopes

    researcher_scope = Scope.find_by(action: 'research', scope: 'user')

    logo_host = ENV["LOGO_HOST"] || 'http://researchresultswebsite.com/assets/'

    clients_mapped = client_result.collect do |row|
      old_client_id = row['id']

      client = Client.find_or_initialize_by(name: row['name']).tap do |c|
        c.company_name      = row['company_name']
        c.contact_type      = row['contact_type']
        c.contact_name      = row['contact_name']
        c.contact_title     = row['contact_title']
        c.contact_phone     = row['contact_phone']
        c.contact_fax       = row['contact_fax']
        c.contact_email     = row['contact_email']
        c.mailing_address_1 = row['mailing_address_1']
        c.mailing_address_2 = row['mailing_address_2']
        c.mailing_city      = row['mailing_city']
        c.mailing_state     = row['mailing_state']
        c.mailing_zip       = row['mailing_zip']
        c.mailing_country   = row['mailing_country']

        c.billing_address_1 = row['billing_address_1']
        c.billing_address_2 = row['billing_address_2']
        c.billing_city      = row['billing_city']
        c.billing_state     = row['billing_state']
        c.billing_zip       = row['billing_zip']
        c.billing_country   = row['billing_country']
        c.slogan            = row['slogan']
        c.client_text       = row['client_text']
        c.closing           = row['closing']
        c.homepage          = row['homepage']
        c.subdomain         = get_subdomain(db_client, row['id'])
        c.created_at        = row['created_at']
        c.updated_at        = row['updated_at'] || Time.zone.now

        c.save if c.new_record?

        begin
          unless c.logo.attached?
            c.logo.attach(io: open("#{logo_host}#{row['id']}.png"), filename: "logo-old-client-id-#{row['id']}.png")
            c.save
          end
        rescue OpenURI::HTTPError
          puts "No logo for client #{row['company_name']}"
        end
      end

      puts "Client #{client.name} created"
      {
          new_id: client.id,
          old_id: row['id'],
          name:   client.name
      }
    end

    old_client_id = clients_mapped.first[:old_id]

    puts 'migrating users'
    user_results = db_client.query("SELECT * FROM accounts WHERE domain_id = '#{old_client_id}'")
    memberships  = []

    admin_scope = Scope.find_by(action: 'admin')

    mapped_users = user_results.collect do |row|
      user = User.find_or_initialize_by(email: row['contact_email'].downcase).tap do |u|
        u.email             = row['contact_email'].downcase
        u.contact_email     = row['contact_email'].downcase
        u.contact_name      = row['contact_name']
        u.company_name      = row['company_name']
        u.contact_title     = row['contact_title']
        u.contact_phone     = row['contact_phone']
        u.contact_fax       = row['contact_fax']
        u.mailing_address_1 = row['mailing_address_1']
        u.mailing_address_2 = row['mailing_address_2']
        u.mailing_city      = row['mailing_city']
        u.mailing_state     = row['mailing_state']
        u.mailing_zip       = row['mailing_zip']
        u.mailing_country   = row['mailing_country']

        u.save
      end

      user.scopes << admin_scope if user.email.split('@').last.downcase == 'mercuryanalytics.com'

      membership = Membership.find_or_initialize_by(
          client_id: get_client(row['domain_id'], clients_mapped),
          user_id:   user.id
      )
      membership.save if membership.new_record?

      client_id = get_client(row['domain_id'], clients_mapped)
      permissions_results = db_client.query("SELECT account_id, GROUP_CONCAT(code, '') as scopes FROM permissions
        WHERE account_id = #{row['id']} GROUP BY account_id;")

      client_auth = Authorization.find_or_initialize_by(
          membership_id: membership.id,
          subject_class: 'Client',
          subject_id: client_id
      )

      client_auth.save if client_auth.new_record?

      permissions_results.each do |row|
        permissions = row['scopes'].split(',')

        if permissions.include?('create_accounts') ||
            permissions.include?('edit_account') ||
            permissions.include?('delete_account') ||
            permissions.include?('create_partner_domain')

          client_auth.client_scopes << client_manager
          client_auth.client_scopes << client_admin
        end
      end
      memberships << membership

      {
          new_id:     user.id,
          old_id:     row['id'],
          belongs_to: row['domain_id'],
          instance:   user
      }
    end


    puts 'Migrating projects'

    projects_results = db_client.query("SELECT * FROM projects WHERE domain_id='#{old_client_id}'")

    mapped_projects = projects_results.collect do |row|
      project = Project.find_or_initialize_by(
          name:           row['name'],
          project_number: row['project_number'],
          domain_id:      row['domain_id']
      ).tap do |p|
        p.name           = row['name']
        p.description    = row['description']
        p.project_number = row['project_number']
        p.domain_id      = get_client(row['domain_id'], clients_mapped)
        p.project_type   = row['project_type']
        p.account_id     = get_user_id(row['account_id'], mapped_users)
        p.modified_on    = row['modified_on']
        p.created_at     = row['created_at']
        p.updated_at     = row['updated_at'] || Time.zone.now
        p.domain_id = Client.find_by(name: 'Mercury Analytics').id if p.domain_id.nil?

        p.save
      end

      {
          new_id:         project.id,
          old_id:         row['id'],
          old_domain_id:  row['domain_id'],
          new_domain_id:  project.domain_id,
          old_account_id: row['account_id']
      }
    end

    puts 'migration reports'

    reports_results = db_client.query(
        "SELECT reports.* FROM reports
         INNER JOIN projects ON reports.project_id = projects.id
         WHERE projects.domain_id = #{old_client_id}"
    )

    missing_reports_projects = []
    mapped_reports = reports_results.collect do  |row|
      project_row = get_project_row(row['project_id'], mapped_projects)

      begin
        project_id = project_row[:new_id]
        client_id  = project_row[:old_domain_id]
      rescue NoMethodError
        puts "cant find project for #{row.inspect}, assigning to MercuryAnalytics"
        missing_reports_projects << { id: row['id'], name: row['name'], project_id: row['project_id'] }

        cl_id = Client.find_by(name: 'Mercury Analytics').id
        project_id = Project.find_or_create_by(
            name: 'Reports without project form migration', domain_id: cl_id
        ).id

        mapped_projects << {
            old_id: row['project_id'],
            new_id: project_id,
            new_domain_id: cl_id,
            old_domain_id: nil
        }

        client_id = clients_mapped.select { |i| i[:new_id] == cl_id }.first[:old_id]
      end

      report = Report.find_or_initialize_by(name: row['name'], project_id: row['project_id']).tap do |r|
        r.name         = row['name']
        r.url          = row['url']
        r.description  = row['description']
        r.project_id   = project_id
        r.presented_on = row['presented_on']
        r.modified_on  = row['modified_on']
        r.created_at   = row['created_at']
        r.updated_at   = row['updated_at'] || Time.zone.now

        r.save
      end

      client_row = get_client_row(client_id, clients_mapped) || {}
      begin
        old_client_id = client_row.fetch(:old_id, project_row[:old_domain_id])
        new_client_id = client_row.fetch(:new_id, project_row[:new_domain_id])
      rescue NoMethodError
        puts "Cannot find the client for #{row.inspect}, using default MercuryAnalytics client"

        {
            new_id:         report.id,
            old_id:         row['id'],
            old_project_id: row['project_id'],
            new_project_id: report.project_id,
            old_domain_id:  nil,
            new_domain_id:  Client.find_by(name: 'Mercury Analytics').id
        }
      end
      {
          new_id:         report.id,
          old_id:         row['id'],
          old_project_id: row['project_id'],
          new_project_id: report.project_id,
          old_domain_id:  old_client_id,
          new_domain_id:  new_client_id
      }
    end



    puts 'adding project authorizations'

    project_authorizations_results     = db_client.query(
        "SELECT project_accesses.* FROM project_accesses INNER JOIN projects ON projects.id = project_accesses.project_id
        WHERE projects.domain_id = '#{old_client_id}'"
    )
    missing_authorizations_project_ids = []

    project_acceses = project_authorizations_results.collect do |row|
      begin
        new_project_row = get_project_row(row['project_id'], mapped_projects)
        new_project_id = new_project_row[:new_id]
        old_client_id = new_project_row[:old_domain_id]
      rescue NoMethodError
        missing_authorizations_project_ids << row['project_id']
        next
      end
      authorization = Authorization.new(
          subject_class: 'Project',
          subject_id:    new_project_id
      ).tap do |auth|
        user = get_user_row(row['account_id'], mapped_users)
        unless user
          puts "skipping #{row.inspect} because the user does not exist"
          next
        end
        client = get_client_row(old_client_id, clients_mapped)

        membership = if client
                       memberships.select { |i| i.client_id == client[:new_id] && i.user_id == user[:new_id] }.first
                     end

        if membership
          auth.membership_id = membership.id
          auth.save

          permissions_results = db_client.query("SELECT account_id, GROUP_CONCAT(code, '') as scopes FROM permissions
        WHERE account_id = #{row['account_id']} GROUP BY account_id;")
          proj = Project.find(new_project_id)

          client_authorization = Authorization.find_or_initialize_by(subject_id: proj.domain_id, subject_class: 'Client', membership_id: membership.id)
          client_authorization.save if client_authorization.new_record?

          permissions_results.each do |row|
            permissions = row['scopes'].split(',')

            if permissions.include?('create_project') ||
                permissions.include?('edit_project') ||
                permissions.include?('delete_project')
              auth.project_scopes << project_manager_role

              if permissions.include?('edit_project_permissions')
                auth.project_scopes << project_admin
              end
            end

            if permissions.include?('view_reports')
              auth.project_scopes << project_access_role
            end
          end

        end
      end
      next if authorization.new_record?

      {
          old_user_id:    row['account_id'],
          old_project_id: row['project_id'],
          new_project_id: new_project_row[:new_id],
          membership_id:  authorization.membership_id,
          authorization:  authorization
      }
    end
    puts "counter for projects #{missing_authorizations_project_ids.size}"

    report_authorizations_results = db_client.query(
        "SELECT report_accesses.* FROM report_accesses
         WHERE report_id IN (#{mapped_reports.map { |r| r[:old_id] }.join(',')})"
    )
    missing_report_authorizations = []

    puts 'adding reports authorizations'

    reports_authorizations = report_authorizations_results.collect do |row|
      new_report_row = get_report_row(row['report_id'], mapped_reports.compact)

      unless new_report_row
        puts "Skipping #{row} since the report could not be found"
        missing_report_authorizations << row['id']
        next
      end

      authorization = Authorization.new(
          subject_class: 'Report',
          subject_id:    new_report_row[:new_id]
      ).tap do |auth|
        user = get_user_row(row['account_id'], mapped_users)

        unless user
          puts "skipping #{row.inspect} because it has nil values"
          next
        end

        client = get_client_row(new_report_row[:old_domain_id], clients_mapped)

        membership = if client
                       memberships.select { |i| i.client_id == client[:new_id] && i.user_id == user[:new_id] }.first
                     end

        if membership
          auth.membership_id = membership.id
          auth.save

          report = Report.find(new_report_row[:new_id])

          project_authorization = Authorization.find_or_initialize_by(
              subject_class: 'Project',
              subject_id: report.project_id,
              membership_id: membership.id
          )
          project_authorization.save if project_authorization.new_record?

          client_authorization = Authorization.find_or_initialize_by(
              subject_class: 'Client',
              subject_id: report.project.domain_id,
              membership_id: membership.id
          )

          client_authorization.save if client_authorization.new_record?

          permissions_results = db_client.query("SELECT account_id, GROUP_CONCAT(code, '') as scopes FROM permissions
        WHERE account_id = '#{row['account_id']}' GROUP BY account_id;")

          auth.save
          permissions_results.each do |row|
            permissions = row['scopes'].split(',')

            if permissions.include?('edit_report')
              auth.report_scopes << report_manager
              auth.report_scopes << report_admin_role if permissions.include?('edit_report_permissions')
            end
          end
        end
      end

      next if authorization.new_record?
      {
          old_report_id: row['report_id'],
          authorization: authorization
      }
    end
  end

  task synchronize_auth: :environment do
    User.where(auth_id: nil).find_in_batches do |users_batch|
      users_batch.each do |user|
        puts "Creating #{user.email} in auth0"
        params = {
          email: user.email
        }
        interactor = Users::CreateAuth0User.call(params: params)
        if interactor.success?
          puts "User created! Setting up the auth_id #{interactor.auth_id} to #{user.email}"
          user.auth_id = interactor.auth_id
          if user.save
            puts 'Success!'
          end
        else
          puts "Could not create the user in Auth0 - error message: #{interactor.message}"
          next
        end

        puts 'Sleeping for a bit to no not throttle auth0'
        sleep 1.5
      end
    end
  end

  def get_project_id(id, projects)
    return nil unless id

    projects.select { |i| i[:old_id].to_i == id.to_i }.first[:new_id]
  end

  def get_report_row(report_id, reports)
    reports.select { |i| i[:old_id] == report_id }.first
  end

  def get_client_row(domain_id, clients)
    return nil unless domain_id

    clients.select { |i| i[:old_id] == domain_id }.first
  end

  def get_user_id(id, users)
    return nil unless id

    u = users.select { |i| i[:old_id] == id }.first
    return u[:new_id] if u

    nil
  end

  def get_user_row(id, users)
    users.select { |i| i[:old_id].to_i == id.to_i }.first
  end

  def get_project_row(id, projects)
    projects.select { |i| i[:old_id].to_i == id.to_i }.first
  end

  def get_client(domain_id, clients)
    return nil unless domain_id

    client = clients.select { |i| i[:old_id] == domain_id }.first
    return client[:new_id] if client
    nil
  end

  def get_subdomain(db_client, client_id)
    db_client
      .query("SELECT host from host_maps WHERE domain_id = #{client_id}")
      .collect do |result|
      next if result['host'].blank?

      result['host'].split('.').first
    end.reject(&:blank?).first
  end
end
