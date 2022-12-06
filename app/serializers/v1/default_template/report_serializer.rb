module V1
  module DefaultTemplate
    class ReportSerializer < ActiveModel::Serializer
      attribute :id
      attribute :name
      attribute :authorized
      attribute :roles

      def authorized
        authorizations.select do |authorization|
          authorization.subject_class == 'Report' && authorization.subject_id == self.object.id
        end.any?
      end

      def roles
        authorization = authorizations.find do |authorization|
          authorization.subject_class == 'Report' && authorization.subject_id == object.id
        end

        return [] unless authorization

        scopes = authorization.scopes

        roles = []
        roles << "report_access" if scopes.map(&:action).include?('access')
        roles << "report_admin" if scopes.map(&:action).include?('authorize')
        roles << "report_editor" if scopes.map(&:action).include?('update')
        roles
      end
    end
  end
end
