# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: 'Star Wars' }, { name: 'Lord of the Rings' }])
#   Character.create(name: 'Luke', movie: movies.first)

Scope.where(action: "admin")
  .first_or_create!(scope: "admin", description: "Global admin", global: true, dynamic: false, name: "Mercury Analytics Admin")
Scope.find_or_create_by(name: 'Researcher', action: 'research', scope: 'user', description: 'Research project', global: true)

# Client scopes
Scope.find_or_create_by(action: 'update', scope: 'client', description: 'Allows editing the client')
Scope.find_or_create_by(action: 'invite', scope: 'client', description: 'Allows inviting a user for client')
Scope.find_or_create_by(action: 'authorize', scope: 'client', description: 'Allows authorizing a user')
Scope.find_or_create_by(action: 'authorized', scope: 'client', description: 'Shows the authorized users for client')

# Base scopes for CRUD
[User, Project, Report, Domain].each do |klass|
  %w(create update destroy).each do |action|
    Scope.find_or_create_by(action: action, scope: klass.to_s.downcase, description: "#{action} the #{klass.to_s}")
  end
end

Scope.find_or_create_by(action: 'invite', scope: 'project', description: 'Allows inviting a user for project')
Scope.find_or_create_by(action: 'authorize', scope: 'project', description: 'Allows authorizing a user on a project')
Scope.find_or_create_by(action: 'authorized', scope: 'project', description: 'Shows the authorized users for project')

Scope.find_or_create_by(action: 'invite', scope: 'report', description: 'Allows inviting a user for report')
Scope.find_or_create_by(action: 'authorize', scope: 'report', description: 'Allows authorizing a user on a report')
Scope.find_or_create_by(action: 'authorized', scope: 'report', description: 'Shows the authorized users for report')

Scope.find_or_create_by(
    name: 'Client access',
    action: 'access',
    scope: 'client',
    description: 'Gives the user full read access to projects / reports'
)
Scope.find_or_create_by(
    name: 'Project access',
    action: 'access',
    scope: 'project',
    description: 'Gives the user full read access to reports under the project'
)