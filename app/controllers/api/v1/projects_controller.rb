module Api
  module V1
    class ProjectsController < BaseController
      before_action :set_project, only: [:show, :update, :destroy]

      load_and_authorize_resource except: %i(create)

      def index
        @projects = params[:client_id] ?
                      Project.accessible_by(current_ability).where(domain_id: params[:client_id]).order(updated_at: :desc).all :
                      Project.accessible_by(current_ability).order(updated_at: :desc).all

        if params[:user_id]
          Authorizations::ChildrenAccess.call(collection: @projects, type: Project, user_id: params[:user_id])
        end

        json_response(@projects)
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
        membership_ids = Authorization.where(
          subject_class: 'Project', subject_id: params[:id]
        ).pluck(:membership_id)

        context = Projects::RemoveProjectOrganizer.call(project: @project, membership_id: membership_ids)

        return render head: :ok if context.success?

        error_response('Could not remove!')
      end

      def show
        json_response(@project)
      end

      def orphans
        return json_response([]) if current_user.admin?

        client_authorizations = Client.authorized_for_user(current_user.membership_ids).pluck(:id)
        projects = Project.where.not(domain_id: client_authorizations).order(updated_at: :desc).accessible_by(current_ability)

        json_response(projects)
      end

      def authorize
        project = Project.find(params[:id])

        options = {
            params: authorize_params.to_h,
            project: project
        }

        options[:params].merge!({ access: params[:access] }) if params.key?(:access)

        base_authorization = Authorizations::BaseAuthorization.call(**options)

        status = base_authorization.status == :ok ? :created : :no_content
        head status
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
                    user.authorized = (user.membership_ids & membership_ids).any? ?
                                        Membership.where(id: (user.membership_ids & membership_ids)).pluck(:client_id) :
                                        []
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
        @current_ability ||= ::ProjectAbility.new(
          current_user,
          params[:client_id] || params[:project]&.fetch(:domain_id, nil) || @project&.domain_id
        )
      end

      def authorize_params
        params.permit(:user_id, :client_id, :authorize, :role, :role_state, :scope_id, :scope_state, :from_admin)
      end
    end
  end
end
