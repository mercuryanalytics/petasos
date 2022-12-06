module V1
  module DefaultTemplate
    class ProjectSerializer < ActiveModel::Serializer
      attribute :id
      attribute :name
      attribute :authorized
      attribute :reports
      attribute :roles

      def reports
        self.object.reports.map do |report|
          ReportSerializer.new(report, scope: self.authorizations, scope_name: :authorizations)
        end
      end

      def authorized
        authorizations.select do |authorization|
          authorization.subject_class == 'Project' && authorization.subject_id == self.object.id
        end.any?
      end

      def roles
        authorization = authorizations.find do |authorization|
          authorization.subject_class == 'Project' && authorization.subject_id == object.id
        end

        return [] unless authorization

        scopes = authorization.scopes

        roles = []
        roles << "project_access" if scopes.map(&:action).include?('access')
        roles << "project_admin" if scopes.map(&:action).include?('authorize')
        roles << "project_editor" if scopes.map(&:action).include?('update')
        roles
      end
    end
  end
end
