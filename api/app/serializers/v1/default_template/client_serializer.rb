module V1
  module DefaultTemplate
    class ClientSerializer < ActiveModel::Serializer
      attribute :id
      attribute :name
      attribute :authorized
      attribute :projects
      attribute :roles

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

      def roles
        authorization = authorizations.find do |authorization|
          authorization.subject_class == 'Client'
        end

        return [] unless authorization

        scopes = authorization.scopes

        roles = []
        roles << "client_access" if scopes.map(&:action).include?('access')
        roles << "client_admin" if scopes.map(&:action).include?('authorize')
        roles << "client_editor" if scopes.map(&:action).include?('update')
        roles
      end
    end
  end
end
