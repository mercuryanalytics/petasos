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
end
