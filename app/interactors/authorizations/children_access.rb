module Authorizations
  class ChildrenAccess
    include Interactor

    delegate :collection, :type, :user_id, to: :context

    def call
      if type == Client
        collection.map do |client|

          project_ids = Project.where(domain_id: client.id).pluck(:id)
          authorizations = project_authorizations(project_ids)

          if authorizations.any?
            client.children_access = true
            next
          else
            report_ids = Report.where(project_id: project_ids).pluck(:id)
            authorizations = report_authorizations(report_ids)

            client.children_access = authorizations.any?
          end
        end
      end

      if type == Project
        collection.map do |project|
          report_ids = Report.where(project_id: project.id).pluck(:id)
          authorizations = report_authorizations(report_ids)

          project.children_access = authorizations.any?
        end
      end
    end

    def project_ids
      @project_ids ||= Project.where(domain_id: collection.map(&:id)).pluck(:id)
    end

    def report_authorizations(report_ids)
      Authorization.includes(:membership).where(subject_class: 'Report', subject_id: report_ids, memberships: { user_id: user_id})
    end

    def project_authorizations(project_ids)
      Authorization.includes(:membership).where(subject_class: 'Project', subject_id: project_ids, memberships: { user_id: user_id})
    end
  end
end
