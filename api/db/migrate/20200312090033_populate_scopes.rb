class PopulateScopes < ActiveRecord::Migration[6.0]
  def change
    [Project, Report, User].each do |klass|
      %w(read create update destroy authorize).each do |action|
        Scope.create!(action: action, scope: klass.to_s.downcase, description: "#{action} the #{klass.to_s}")
      end
    end
  end
end
