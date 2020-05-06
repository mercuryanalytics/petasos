# Responsible for returning reports when:
# 1) Client authorization exists
# 2) Project authorization does not exist
# 3) Report authorization exists
module Reports
  class OrphanPerClient
    include Interactor

    delegate :user, to: :context

    def call
      if user.admin?
        context.reports = []
        return
      end

      reports = Report.accessible_by(ReportAbility.new(user))
                  .joins(:project).where.not(project_id: project_authorizations)
                  .where(projects: { domain_id: client_authorizations })

      context.reports = reports
    end

    private

    def client_authorizations
      @client_authorizations ||= Client.authorized_for_user(user.membership_ids).pluck(:id)
    end

    def project_authorizations
      @project_authorizations ||= Project.authorized_for_user(user.membership_ids).pluck(:id)
    end
  end
end
