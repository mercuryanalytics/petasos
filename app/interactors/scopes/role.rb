# frozen_string_literal: true
#
# Defines some basic programmatic roles which will return the needed scopes
module Scopes
  class Role
    include Interactor

    AUTHORIZE_ACTION  = 'authorize'
    AUTHORIZED_ACTION = 'authorized'
    INVITE_ACTION     = 'invite'

    CLIENT_MANAGER_ROLE  = 'client_manager'
    CLIENT_ADMIN_ROLE    = 'client_admin'
    PROJECT_ADMIN_ROLE   = 'project_admin'
    PROJECT_MANAGER_ROLE = 'project_manager'
    REPORT_ADMIN_ROLE    = 'report_admin'
    REPORT_MANAGER_ROLE  = 'report_manager'

    delegate :role, to: :context

    def call
      context.fail!(message: 'No role could be found') unless roles

      context.scopes = roles
    end

    def roles
      @roles ||= case role
                 when CLIENT_ADMIN_ROLE
                   client_admin_role
                 when CLIENT_MANAGER_ROLE
                   client_manager_role
                 when PROJECT_ADMIN_ROLE
                   project_admin_role
                 when PROJECT_MANAGER_ROLE
                   project_manager_role
                 when REPORT_ADMIN_ROLE
                   report_admin_role
                 when REPORT_MANAGER_ROLE
                   report_manager_role
                 else
                   nil
                 end
    end

    def client_manager_role
      (user_scopes + domain_scopes).reject do |scope|
        [AUTHORIZE_ACTION, INVITE_ACTION, AUTHORIZED_ACTION].include?(scope.action)
      end + (project_scopes + client_scopes + report_scopes).select do |scope|
        scope.action == 'update'
      end
    end

    def client_admin_role
      client_scopes.select {|scope| [AUTHORIZE_ACTION, INVITE_ACTION, AUTHORIZED_ACTION].include?(scope.action) }
    end

    def project_manager_role
      project_scopes.reject do |scope|
        [AUTHORIZE_ACTION, INVITE_ACTION, AUTHORIZED_ACTION].include?(scope.action)
      end + report_scopes.reject do |scope|
        [AUTHORIZE_ACTION, INVITE_ACTION, AUTHORIZED_ACTION].include?(scope.action)
      end
    end

    def project_admin_role
      project_scopes.select { |scope| [AUTHORIZE_ACTION, INVITE_ACTION, AUTHORIZED_ACTION].include?(scope.action) }
    end

    def report_manager_role
      report_scopes.select { |scope| scope.action == 'update' }
    end

    def report_admin_role
      report_scopes.select do |scope|
        [AUTHORIZE_ACTION, INVITE_ACTION, AUTHORIZED_ACTION].include?(scope.action)
      end
    end

    def user_scopes
      @user_scopes ||= Scope.for_user.data_level
    end

    def client_scopes
      @client_scopes ||= Scope.for_client.data_level
    end

    def project_scopes
      @project_scopes ||= Scope.for_project.data_level
    end

    def report_scopes
      @report_scopes ||= Scope.for_report.data_level
    end

    def domain_scopes
      @domain_scopes ||= Scope.for_domain.data_level
    end
  end
end
