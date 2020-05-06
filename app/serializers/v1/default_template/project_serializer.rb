module V1
  module DefaultTemplate
    class ProjectSerializer < ActiveModel::Serializer
      attribute :id
      attribute :name
      attribute :authorized
      attribute :reports

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
    end
  end
end
