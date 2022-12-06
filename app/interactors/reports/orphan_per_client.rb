# Responsible for returning reports when:
# 1) Client authorization exists
# 2) Project authorization does not exist
# 3) Report authorization exists
module Reports
  class OrphanPerClient
    include Interactor

    delegate :user, :client_id, to: :context

    def call
      if user.admin? || has_access_or_authorize_scopes?
        context.reports = []
        return
      end

      reports = Report.accessible_by(ReportAbility.new(user))
                  .joins(:project).where.not(project_id: project_authorizations)
                  .where(projects: { domain_id: client_authorizations })
                  .order(updated_at: :desc)

      context.reports = reports
    end

    private

    def client_authorizations
      @client_authorizations ||= Client.authorized_for_user(user.membership_ids).pluck(:id)
    end

    def has_access_or_authorize_scopes?
      has = false

      Authorization.preload(:client_scopes).where(subject_id: client_id, subject_class: 'Client').find_each do |auth|
        has = true if auth.client_scopes.any? { |scope| %w[access authorize].include?(scope.action) }
      end

      has
    end

    def project_authorizations
      @project_authorizations ||= Project.authorized_for_user(user.membership_ids).pluck(:id)
    end
  end
end
