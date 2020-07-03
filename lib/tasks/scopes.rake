namespace :scopes do
  desc 'Creates a dynamic scope'
  task create: :environment do
    options = {
      action:      nil,
      scope:       nil,
      description: nil,
      name:        nil,
    }

    o        = OptParse.new
    o.banner = 'Usage: rake scopes:create OPTIONS'
    o.on('--action', '--action ACTION_NAME') { |input| options[:action] = input }
    o.on('--scope', '--scope report,project,client') { |input| options[:scope] = input }
    o.on('--description', '--description DESCRIPTION') { |input| options[:description] = input }
    o.on('--name', '--name NAME') { |input| options[:name] = input }
    o.parse!(o.order(ARGV) {})

    unless %w[reports projects clients].include?(options[:scope])
      puts "Please specify the correct resource scope (one of report, project, client); you specified #{options[:scope]}"
      exit(1)
    end

    if Scope.exists?(dynamic: true, **options)
      puts 'The scope already exists'
      exit(1)
    end

    scope = Scope.new(dynamic: true, **options)
    if scope.save
      puts 'Scope added'
      exit(1)
    end

    puts "Could not add scope because of #{scope.errors.as_json}"
  end
end
