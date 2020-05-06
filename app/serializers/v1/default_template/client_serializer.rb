module V1
  module DefaultTemplate
    class ClientSerializer < ActiveModel::Serializer
      attribute :id
      attribute :name
      attribute :authorized
      attribute :projects

      def projects
        self.object.projects.map do |project|
          ProjectSerializer.new(project, scope: self.authorizations, scope_name: :authorizations)
        end
      end

      def authorized
        authorizations.select do |authorization|
          authorization.subject_class == 'Client' && authorization.subject_id == self.object.id
        end.any?
      end
    end
  end
end
