# frozen_string_literal: true

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
      o.parse!(o.order(ARGV) {}) # rubocop:disable Lint/EmptyBlock -- discards non-option args intentionally

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
      talaria_global_scopes = [
        {
          scope: "workbench",
          action: "operator",
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

      # TODO: Reemplement these scopes once dynamic scopes are fixed
      talaria_dynamic_scopes = [
        # {
        #   scope: "clients",
        #   action: "download_hart_data",
        #   name: "Hart Research Data Format",
        #   description: "Can download Hart Research data format on Workbench",
        #   dynamic: true
        # },
        # {
        #   scope: "clients",
        #   action: "download_gba_data",
        #   name: "GBA Strategies Data Format",
        #   description: "Can download GBA Strategies data format on Workbench",
        #   dynamic: true
        # },
        # {
        #   scope: "clients",
        #   action: "download_g2_data",
        #   name: "G2analytics Data Format",
        #   description: "Can download G2analytics data format on Workbench",
        #   dynamic: true
        # },
        # {
        #   scope: "clients",
        #   action: "download_gpg_data",
        #   name: "GPG Data Format",
        #   description: "Can download GPG data format on Workbench",
        #   dynamic: true
        # }
      ].freeze

      (talaria_global_scopes + talaria_dynamic_scopes).each do |scope|
        permission = Scope.where(scope: scope[:scope], action: scope[:action], global: scope[:global], dynamic: scope[:dynamic]).first_or_initialize.tap do |p|
          p.name = scope[:name]
          p.description = scope[:description]
        end
        permission.save!
        puts "Created/Updated talaria scope #{permission.action} with name #{permission.name}"
      end

      deprecated_scope_descriptions = [
        {
          scope: "projects",
          action: "financial_access",
          description: "Financial access scope",
          global: false,
          dynamic: true,
          name: "Financial Manager"
        },
        {
          scope: "reports",
          action: "view_report",
          description: "Report dynamic permission",
          global: false,
          dynamic: true,
          name: "Report viewer"
        }
      ].freeze

      deprecated_scope_descriptions.each do |desc|
        s = Scope.find_by(desc)
        if s.present?
          s.destroy!
          puts "Found deprecated e-spres-oh scope #{s.action} with name #{s.name}. Destroying..."
        end
      end
    end
  end

  desc "List all scopes' action by scope and type as CSV"
  task list: :environment do
    CSV do |csv|
      csv << %w[scope type action name description]
      scopes = Scope.all.map do |scope|
        global = scope.global
        dynamic = scope.dynamic
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
