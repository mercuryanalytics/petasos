module V1
  module DefaultTemplate
    class ReportSerializer < ActiveModel::Serializer
      attribute :id
      attribute :name
      attribute :authorized

      def authorized
        authorizations.select do |authorization|
          authorization.subject_class == 'Report' && authorization.subject_id == self.object.id
        end.any?
      end
    end
  end
end
