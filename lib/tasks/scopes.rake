require "csv"

namespace :scopes do
  namespace :create do
    desc "Creates a dynamic scope"
    task dynamic: :environment do
      options = {
        action: nil,
        scope: nil,
        description: nil,
        name: nil
      }

      o = OptParse.new
      o.banner = "Usage: rake scopes:create:dynamic OPTIONS"
      o.on("--action", "--action ACTION_NAME") {|input| options[:action] = input }
      o.on("--scope", "--scope reports,projects,clients") {|input| options[:scope] = input }
      o.on("--description", "--description DESCRIPTION") {|input| options[:description] = input }
      o.on("--name", "--name NAME") {|input| options[:name] = input }
      o.parse!(o.order(ARGV) {})

      scope = Scope.new(dynamic: true, **options)
      if scope.save
        puts "Scope added"
        exit(1)
      end

      puts "Could not add scope because of #{scope.errors.as_json}"
    end

    desc "Creates a global scope"
    task :global, %i[scope action name description] => :environment do |_, params|
      Scope.create!(scope: params[:scope], action: params[:action], name: params[:name], description: params[:description], global: true)
      puts "Created global scope with params #{params.inspect}"
    end

    desc "Add talaria scopes"
    task talaria: :environment do
      TALARIA_GLOBAL_SCOPES = [
        {
          scope: "workbench",
          action: "admin",
          name: "Workbench Admin",
          description: "For engineering team",
          global: true
        },
        {
          scope: "workbench",
          action: "view_billing",
          name: "Billing User",
          description: "Can view billing information on Workbench",
          global: true
        },
        {
          scope: "workbench",
          action: "manage_billing",
          name: "Billing Owner",
          description: "Can open and close projects on Workbench",
          global: true
        },
        {
          scope: "workbench",
          action: "destroy_response",
          name: "Destroy Response",
          description: "Can destroy responses on Workbench",
          global: true
        }
      ].freeze

      TALARIA_DYNAMIC_SCOPES = [
        {
          scope: "clients",
          action: "download_hart_data",
          name: "Download Hart Research Data Format",
          description: "Can download Hart Research data format on Workbench",
          dynamic: true
        },
        {
          scope: "clients",
          action: "download_gba_data",
          name: "Download GBA Strategies Data Format",
          description: "Can download GBA Strategies data format on Workbench",
          dynamic: true
        },
        {
          scope: "clients",
          action: "download_g2_data",
          name: "Download G2analytics Data Format",
          description: "Can download G2analytics data format on Workbench",
          dynamic: true
        },
        {
          scope: "clients",
          action: "download_gpg_data",
          name: "Download GPG Data Format",
          description: "Can download GPG data format on Workbench",
          dynamic: true
        }
      ].freeze

      NBCU_SCOPES = [
        {
          scope: "clients",
          action: "access_biometrics",
          name: "Biometrics Access",
          description: "Can use the NBCU biometrics tool",
          dynamic: true
        }
      ].freeze

      (TALARIA_GLOBAL_SCOPES + TALARIA_DYNAMIC_SCOPES + NBCU_SCOPES).each do |scope|
        permission = Scope.where(scope: scope[:scope], action: scope[:action], global: scope[:global], dynamic: scope[:dynamic]).first_or_initialize.tap do |p|
          p.name = scope[:name]
          p.description = scope[:description]
        end
        permission.save!
      end
      puts "Created talaria scopes"
    end
  end

  desc "List all scopes' action by scope and type as CSV"
  task list: :environment do
    CSV do |csv|
      csv << %w[scope type action name description]
      scopes = Scope.all.map do |scope|
        global, dynamic = [scope.global, scope.dynamic]
        scope_type = if global && dynamic
                       "global_dynamic"
                     elsif global
                       "global"
                     elsif dynamic
                       "dynamic"
                     else
                       "data_level"
                     end
        [scope_type, scope.scope, scope.action, scope.name, scope.description]
      end
      scopes.sort_by {|s| [s.first, s.second, s.third] }.each {|a| csv << a }
    end
  end
end
