module Api
  module V1
    class ReportsController < BaseController
      before_action :set_report, only: [:show, :update, :destroy]

      load_and_authorize_resource

      def index
        if params[:project_id]
          json_response(Report.where(project_id: params[:project_id]).includes(:project).order(updated_at: :desc).accessible_by(current_ability).all)
          return
        end

        if params[:client_id] && !current_user.admin?
          json_response(
              Report
                  .includes(:project)
                  .where(projects: { domain_id: params[:client_id]} )
                  .order(updated_at: :desc)
                  .accessible_by(current_ability).all)
          return
        end

        json_response(Report.includes(:project).accessible_by(current_ability).order(updated_at: :desc).all)
      end

      def orphans
        return json_response([]) if current_user.admin?

        client_authorizations = Client.authorized_for_user(current_user.membership_ids).pluck(:id)
        project_authorizations = Project.authorized_for_user(current_user.membership_ids).pluck(:id)

        reports = Report.accessible_by(current_ability)
                    .joins(:project)
                    .where.not(project_id: project_authorizations)
                    .where.not(projects: { domain_id: client_authorizations })
                    .order(updated_at: :desc)

        json_response(reports)
      end

      def create
        @authorized = Report.new(project_id: report_params[:project_id])
        authorize!(:create, @authorized)

        context = Reports::CreateReportOrganizer.call(params: report_params, user: current_user)

        return json_response(context.report, :created) if context.success?

        error_response(context.message)
      end

      def update
        context = Reports::UpdateReportOrganizer.call(params: report_params, report: @report)

        return json_response(context.report) if context.success?

        error_response(context.message)
      end

      def destroy
        context = Reports::RemoveReportOrganizer.call(report: @report)

        return render head: :ok if context.success?

        error_response(context.message)
      end

      def show
        json_response(@report)
      end

      def authorize
        base_authorization = Authorizations::BaseAuthorization.call(
          params: authorize_params.to_h,
          report: Report.find(params[:id])
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
          subject_class: 'Report', subject_id: params[:id]
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

      def set_report
        @report = Report.find(params[:id])
      end

      def report_params
        params
          .require(:report)
          .permit(:name, :url, :project_id, :description, :presented_on, :modified_on, :project_id)
      end

      def current_ability
        @current_ability ||= ::ReportAbility.new(
          current_user,
          params[:project_id] || params[:report].fetch(:project_id, nil) || @report&.project_id
        )
      end

      def authorize_params
        params.permit(:user_id, :client_id, :authorize, :role, :role_state, :scope_id, :scope_state)
      end
    end
  end
end
