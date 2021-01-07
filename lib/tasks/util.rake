# frozen_string_literal: true

require 'optparse'

namespace :util do
  desc "Export sso census"
  task census: :environment do
    require 'open-uri'
    require 'csv'

    options = {
      database_name: nil,
      database_host: nil,
      database_user: nil,
      database_password: nil
    }

    o        = OptParse.new
    o.banner = 'Usage: rake import OPTIONS'
    o.on('--db-name', '--db-name=DATABASE_NAME') {|input| options[:database_name] = input }
    o.on('--db-host', '--db-host=DATABASE_HOST') {|input| options[:database_host] = input }
    o.on('--db-pass', '--db-pass=DATABASE_PASSWORD') {|input| options[:database_password] = input }
    o.on('--db-user', '--db-user=DATABASE_USER') {|input| options[:database_user] = input }
    o.parse!(o.order(ARGV) {})

    db_client = Mysql2::Client.new(
      host: options[:database_host],
      username: options[:database_user],
      password: options[:database_password],
      database: options[:database_name]
    )

    domains = db_client.query("SELECT * FROM domains ORDER BY name").to_a.each.with_object({}) do |row, ds|
      ds[row["id"]] = row["name"]
    end

    CSV do |csv|
      db_client.query("SELECT * FROM accounts ORDER BY domain_id, contact_email").each do |row|
        csv << ["#{domains[row['domain_id']]}/#{row['name']}", row["contact_email"].downcase]
      end
    end
  end

  desc "Export all users that have auth_ids to a csv file"
  task export_auth_ids: :environment do
    require 'csv'

    CSV do |csv|
      User.where.not(auth_id: nil).each do |user|
        csv << [user.email, user.auth_id]
      end
    end
  end

  desc "Import auth_ids from a csv file"
  task :import_auth_ids, %i[file] => :environment do |_, params|
    require "csv"

    ActiveRecord::Base.transaction do
      CSV.foreach(params[:file]) do |email, auth_id|
        User.find_by!(email: email).update(auth_id: auth_id)
      rescue ActiveRecord::RecordNotFound
        puts "could not find user with email #{email.inspect}"
      end
    end
  end

  desc "Removing permissions from users"
  task :remove_user_permissions, %i[file] => :environment do |_, params|
    require "csv"

    ActiveRecord::Base.transaction do
      CSV.foreach(params[:file]) do |email|
        User.find_by!(email: email).scopes.delete_all
      rescue ActiveRecord::RecordNotFound
        puts "could not find user with email #{email.inspect}"
      end
    end
  end
end
