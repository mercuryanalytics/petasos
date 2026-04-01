# frozen_string_literal: true

namespace :db do
  namespace :pg do
    desc "Restore postgres database from snapshot"
    task :restore, %i[snapshot] => ["db:drop", "db:create"] do |_, params|
      config = Rails.configuration.database_configuration[Rails.env]
      raise "Not a postgres database" unless config["adapter"] == "postgresql"

      dbname = config["database"]

      cmd = ["pg_restore"]
      cmd << "--verbose"
      cmd << "--dbname=#{dbname}"
      cmd << params.fetch(:snapshot, "sandbox/researchresultswebsite_production.sql")

      puts "Remember to run `rails db:environment:set db:test:prepare` if needed"
      exec(*cmd)
    end
  end

  desc "Restore database from snapshot"
  task :restore, %i[snapshot] => ["pg:restore", "environment:set", "test:prepare"]
end
