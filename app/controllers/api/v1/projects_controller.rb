module Api
  module V1
    class ProjectsController < BaseController
      before_action :set_project, only: [:show, :update, :destroy]

      load_and_authorize_resource except: %i(create)

      def index
        if params[:client_id]
          json_response(
            Project
              .accessible_by(current_ability)
              .where(domain_id: params[:client_id])
              .all
          )
          return
        end

        json_response(
          Project.accessible_by(current_ability).all
        )
      end

      def create
        @authorization = Project.new(domain_id: project_params[:domain_id])
        authorize!(:create, @authorization)

        context = Projects::CreateProjectOrganizer.call(params: project_params, user: current_user)

        return json_response(context.project, :created) if context.success?

        error_response(context.message)
      end

      def update
        context = Projects::UpdateProjectOrganizer.call(params: project_params, project: @project)

        return json_response(context.project) if context.success?

        error_response(context.message)
      end

      def destroy
        context = Projects::RemoveProjectOrganizer.call(project: @project)

        return render head: :ok if context.success?

        error_response('Could not remove!')
      end

      def show
        json_response(@project)
      end

      def orphans
        return json_response([]) if current_user.admin?

        client_authorizations = Client.authorized_for_user(current_user.membership_ids).pluck(:id)
        projects = Project.where.not(domain_id: client_authorizations).accessible_by(current_ability)

        json_response(projects)
      end

      def authorize
        base_authorization = Authorizations::BaseAuthorization.call(
          params: authorize_params.to_h,
          project: Project.find(params[:id])
        )

        render error_response(base_authorization.message) && return unless base_authorization.success?

        status = base_authorization.status == :ok ? :created : :no_content
        authorization = base_authorization.authorization

        return head status unless current_user.admin? && authorization

        role_interactor = Authorizations::RoleSetter.call(
          params: authorize_params.to_h,
          authorization: authorization
        )

        render error_response(role_interactor.message) && return unless role_interactor.success?

        dynamic_scopes_interactor = Authorizations::DynamicScope.call(
          params: authorize_params.to_h,
          authorization: authorization
        )

        render error_response(dynamic_scopes_interactor.message) && return unless dynamic_scopes_interactor.success?

        head :ok
      end

      def authorized
        membership_ids = Authorization.where(
          subject_class: 'Project', subject_id: params[:id]
        ).pluck(:membership_id)


        users = if params[:client_id]
                  User.includes(:memberships).for_client(params[:client_id]).find_each.collect do |user|
                    user.authorized = (user.membership_ids & membership_ids).any?
                    user
                  end
                else
                  User.includes(:memberships).find_each.collect do |user|
                    user.authorized = (user.membership_ids & membership_ids)
                    user
                  end
                end


        json_response(users)
      end

      private

      def set_project
        @project = Project.find(params[:id])
      end

      def project_params
        params
          .require(:project)
          .permit(:name, :description, :project_number, :project_type, :account_id, :domain_id, :modified_on)
      end

      def current_ability
        @current_ability ||= ::ProjectAbility.new(current_user, params[:client_id] || @project&.domain_id)
      end

      def authorize_params
        params.permit(:user_id, :client_id, :authorize, :role, :role_state, :scope_id, :scope_state)
      end
    end
  end
end
