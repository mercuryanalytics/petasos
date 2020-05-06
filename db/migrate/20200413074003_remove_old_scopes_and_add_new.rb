class RemoveOldScopesAndAddNew < ActiveRecord::Migration[6.0]
  def change
    Scope.destroy_all

    # Client scopes
    Scope.create!(action: 'update', scope: 'client', description: 'Allows editing the client')
    Scope.create!(action: 'invite', scope: 'client', description: 'Allows inviting a user for client')
    Scope.create!(action: 'authorize', scope: 'client', description: 'Allows authorizing a user')
    Scope.create!(action: 'authorized', scope: 'client', description: 'Shows the authorized users for client')

    # Base scopes for CRUD
    [User, Project, Report, Domain].each do |klass|
      %w(create update destroy).each do |action|
        Scope.create!(action: action, scope: klass.to_s.downcase, description: "#{action} the #{klass.to_s}")
      end
    end

    Scope.create!(action: 'invite', scope: 'project', description: 'Allows inviting a user for project')
    Scope.create!(action: 'authorize', scope: 'project', description: 'Allows authorizing a user on a project')
    Scope.create!(action: 'authorized', scope: 'project', description: 'Shows the authorized users for project')

    Scope.create!(action: 'invite', scope: 'report', description: 'Allows inviting a user for report')
    Scope.create!(action: 'authorize', scope: 'report', description: 'Allows authorizing a user on a report')
    Scope.create!(action: 'authorized', scope: 'report', description: 'Shows the authorized users for report')
  end
end
