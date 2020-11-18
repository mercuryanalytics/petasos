namespace :users do
  desc 'create admin user'
  task :create_admin_user, [:email, :password] => [:environment] do |_, args|
    email = args[:email]
    password = args[:password]

    unless email.present?
      puts 'email is not set'
      exit
    end

    unless password
      puts 'Creating the user with a random password, you can update it in your Auth0 dashboard'
    end

    interactor = Users::CreateUserOrganizer.call(
      params: { email: email, password: password },
      no_auth: 1,
      new_user: 0,
      authorization_params: {}
    )

    if interactor.success?
      puts "Created #{email} user"

      puts 'adding the admin scope'

      admin_scope = Scope.find_by(scope: 'admin')
      interactor.user.scopes << admin_scope

      exit
    end

    puts "Something went wrong #{interactor.message}"
  end

  desc 'Adds the research scope to all users'
  task populate_users_with_research_scope: :environment do
    scope = Scope.find_by(action: 'research', scope: 'project')
    User.find_each do |user|
      user.scopes << scope unless user.scopes.include?(scope)
    end
  end

  desc 'Adds some data to users'
  task add_random_data_to_users: :environment do
    User.find_each do |user|
      user.contact_phone = rand(1e9...1e10).to_i
      user.save
    end
  end

  desc 'Moves the client to membership'
  task move_clients_to_membership: :environment do
    puts 'Creating memberships'

    User.find_each do |user|
      puts "Creating the base membership for #{user.email}"
      client = Client.find(user&.client_id)
      next unless client

      puts 'Getting the authorizations per client'
      Authorization.where(user_id: user.id, subject_class: 'Client').find_each do |auth|
        client = Client.find(auth.subject_id)
        next unless client

        puts "Adding client #{client.name} to user"

        user.clients << client unless user.clients.include?(client)

        auth.membership_id = user.memberships.last.id
        auth.save
      end

      Authorization.where(user_id: user.id, subject_class: 'Project').find_each do |auth|
        project = Project.find(auth.subject_id)
        next unless project
        membership = Membership.where(user_id: user.id, client_id: project.domain_id)
        auth.membership_id = membership.id
        auth.save
      end

      Authorization.where(user_id: user.id, subject_class: 'Report').find_each do |auth|
        report = Report.find(auth.subject_id)
        next unless report
        membership = Membership.where(user_id: user.id, client_id: report.project.domain_id)
        auth.membership_id = membership.id
        auth.save
      end

    rescue => e
      "Rescuing form #{e}"
      next
    end
  end

  desc 'Returns the user permission'
  task :audit, [:email] => [:environment] do |_, args|

    email = args[:email]

    user = User.find_by(email: email)
    unless user
      puts "User #{email} could not be found"
      exit
    end

    memberships_ids = user.memberships.pluck(:id)

    auths = Authorization.preload(:scopes)
                .preload(:dynamic_scopes)
                .left_joins(:scopes)
                .where(membership_id: memberships_ids)
                .select(:id, :subject_class, :subject_id)
                .distinct


    authorizations = auths.map do |authorization|
      [
          authorization,
          get_role_from_scopes(authorization, authorization.scopes),
          authorization.dynamic_scopes
      ]
    end

    authorizations = authorizations.group_by { |i| i.first.subject_class }.map do |k, v|
      { k.downcase => v }
    end

    client_authorizations = authorizations.select { |i| i.keys.include?('client') }.first.values
    project_authorizations = authorizations.select { |i| i.keys.include?('project') }.first.values
    report_authorizations = authorizations.select { |i| i.keys.include?('report') }.first.values


    puts "User #{user.email} has the following global permissions:"
    puts "Global admin" if user.scopes.map(&:action).include?('admin')
    puts "Researcher" if user.scopes.map(&:action).include?('research')

    puts "Listing permissions"

    clients_list = []
    projects_list = []
    reports_list = []

    client_authorizations.first.each do |client_auth|
      client_data = client_auth.first
      c = Client.find(client_data[:subject_id])
      clients_list << [c, client_auth.second]
    end

    project_authorizations.first.each do |proj_auth|
      proj_data = proj_auth.first
      p = Project.find(proj_data[:subject_id])
      projects_list << [p, proj_auth.second]
    end


    report_authorizations.first.each do |rep_auth|
      rep_data = rep_auth.first
      r = Report.find(rep_data[:subject_id])
      reports_list << [r, rep_auth.second]

    end

    clients_list.each do |(client, permissions)|
      puts "Client #{client.name} - with the following permissions: #{permissions.join(', ')}"

      p = projects_list.select { |(project, _)| project.domain_id == client.id }

      projects_list = projects_list - p

      p.each do |(project, perm)|
        puts "\t Project #{project.project_number} #{project.name} - with the following permissions: #{perm.join(', ')}"
        r = reports_list.select {|(report, _)| report.project_id == project.id }
        reports_list = reports_list - r
        r.each do |(report, r_perm)|
          puts "\t\t Report #{report.name} - with the following permissions: #{r_perm.join(', ')}"
        end
      end
    end

    if projects_list.any?
      puts 'Orphan projects'

      projects_list.each do |(project, perm)|
        puts "\t Project #{project.project_number} #{project.name} - client #{project.client.name} with the following permissions: #{perm.join(', ')}"
        r = reports_list.select {|(report, _)| report.project_id == project.id }
        reports_list = reports_list - r if r.any?
        r.each do |(report, r_perm)|
          puts "\t\t Report #{report.name} - with the following permissions: #{r_perm.join(', ')}"
        end
      end
    end


    if reports_list.any?
      puts 'Orphan reports'
      reports_list.each do |(report, r_perm)|
        puts "\t\t Report #{report.name} - project #{report.project.name} client #{report.project.client.name} with the following permissions: #{r_perm.join(', ')}"
      end
    end


  end

  def get_role_from_scopes(authorization, scopes)
    dimension = authorization.subject_class.downcase
    roles = []
    roles << "#{dimension}_access" if scopes.map(&:action).include?('access')
    roles << "#{dimension}_admin" if scopes.map(&:action).include?('authorize')
    roles << "#{dimension}_editor" if scopes.map(&:action).include?('update')
    roles << 'viewer'
    roles
  end
end
