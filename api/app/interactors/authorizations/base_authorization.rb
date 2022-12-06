module Authorizations
  class BaseAuthorization
    include Interactor

    delegate :params, :client, :project, :report, :from_admin, to: :context

    def call
      if add_authorization?
        create_authorizations
      end

      if remove_authorization?
        remove_authorizations
      end

      if access_key?
        create_authorizations unless remove_authorization?
        authorize? ? create_access : remove_access
      end

      if roles?
        create_authorizations
        handle_roles
      end

      if scope?
        create_authorizations
        handle_dynamic_scopes
      end

      context.status = :ok
    end

    def create_authorizations
      @authorizations = membership_ids.collect do |membership_id|
        interactor = AddAuthorization.call(
            user_id: params[:user_id],
            client_id: @client_id || params[:client_id],
            membership_id: membership_id,
            **instance
        )

        interactor.authorization
      end
    end

    def handle_roles
      @authorizations.each do |authorization|
        Authorizations::RoleSetter.call(
            params: params,
            authorization: authorization
        )
      end
    end

    def handle_dynamic_scopes
      @authorizations.each do |authorization|
        Authorizations::DynamicScope.call(
            params: params,
            authorization: authorization
        )
      end
    end

    def remove_authorizations
      membership_ids.each do |membership_id|
        RemoveAuthorization.call(
            user_id: params[:user_id],
            client_id: @client_id || params[:client_id],
            membership_id: membership_id,
            **instance
        )
      end
    end

    def create_access
      if project
        @authorizations.each { |authorization| authorization.scopes << access_scope }
        membership_ids.each do |membership_id|
          AddAuthorization.call(
            user_id: params[:user_id],
            client_id: project.domain_id,
            membership_id: membership_id,
            client: project.client
          )
        end
      end

      if report
        project = report.project

        membership_ids.each do |membership_id|
          AddAuthorization.call(
              user_id: params[:user_id],
              client_id: report.project.domain_id,
              membership_id: membership_id,
              report: report
          )

          AddAuthorization.call(
              user_id: params[:user_id],
              client_id: project.domain_id,
              membership_id: membership_id,
              project: project
          )

          client = project.client
          Authorizations::AddAuthorization.call(
              client: client,
              user_id: params[:user_id],
              client_id: params[:client_id],
              membership_id: membership_id
          )
        end
      end
    end

    def remove_access
      if project
        project_ids = Project.where(domain_id: project.domain_id).pluck(:id)

        membership_ids.each do |membership_id|
          other_authorizations = Authorization.where(
              subject_class: 'Project',
              subject_id: project_ids,
              membership_id: membership_id
          ).count

          Authorization.find_by(
              subject_class: 'Client',
              subject_id: project.domain_id,
              membership_id: membership_id
          )&.destroy if other_authorizations.zero?
        end
      end

      if report
        project = report.project
        other_report_ids = Report.where(project_id: report.project_id).pluck(:id)
        client_id = project.domain_id

        project_ids = Project.where(domain_id: client_id).pluck(:id)

        membership_ids.each do |membership_id|
          Authorization.find_by(
              subject_class: 'Report',
              subject_id: report.id,
              membership_id: membership_id
          )&.destroy

          other_report_authorizations = Authorization.where(
              subject_class: 'Report',
              subject_id: other_report_ids,
              membership_id: membership_id
          ).count

          Authorization.find_by(
              subject_class: 'Project',
              subject_id: project.id,
              membership_id: membership_id
          )&.destroy if other_report_authorizations.zero?

          other_project_authorizations = Authorization.where(
              subject_class: 'Project',
              subject_id: project_ids,
              membership_id: membership_id
          ).count

          Authorization.find_by(
              subject_class: 'Client',
              subject_id: client_id,
              membership_id: membership_id
          )&.destroy if other_project_authorizations.zero?
        end
      end
    end

    def add_authorization?
      params.key?(:authorize) && params[:authorize]
    end

    def remove_authorization?
      params.key?(:authorize) && !params[:authorize]
    end


    def instance
      return { report: report } if report
      return { project: project } if project
      return { client: client } if client

      context.fail!(message: 'wrong instance supplied')
    end

    def authorization_instance
      @membership ||= Membership.find_by(user_id: params[:user_id], client_id: @client_id || params[:client_id])

      Authorization.find_or_create_by(
        membership_id: @membership.id,
        subject_class: subject_class,
        subject_id:    subject_id
      ) if @membership
    end

    def subject_class
      (report || project || client).class.to_s
    end

    def subject_id
      (report || project || client).id
    end

    def from_superadmin?
      params.key?(:from_admin)
    end

    def membership_ids
      query = { user_id: params[:user_id] }
      query.merge!({ client_id: @client_id || params[:client_id] }) unless from_superadmin?

      @membership_ids ||= Membership.where(query).pluck(:id)
    end

    def access_key?
      params.key?(:access)
    end

    def authorize?
      params[:authorize]
    end

    def scope?
      params.key?(:scope_state)
    end

    def roles?
      params.key?(:role)
    end

    def access_scope
      @access_scope ||= Scope.find_by(action: 'access', scope: 'project')
    end
  end
end
