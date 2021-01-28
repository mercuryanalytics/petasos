module Authorizations
  class AddAuthorization
    include Interactor

    delegate :client, :project, :report, :user, :user_id, :params, :no_auth, to: :context

    attr_reader :instance

    def call
      return if no_auth.to_i == 1

      @instance = report || project || client

      context.fail!(message: 'Authorization setup failed, no instance found') unless instance

      auth = Authorization.find_or_initialize_by(
        subject_class: instance.class.to_s,
        subject_id:    instance.id,
        membership_id: membership.id
      )

      context.client_id = client_id

      context.fail!(message: auth.errors) unless auth.save

      context.user&.authorized = true
      context.authorization = auth
    end

    def membership
      @membership ||= Membership.find_by(user_id: user&.id || user_id, client_id: client_id) ||
          user&.memberships&.first ||
          User.find(user_id).memberships&.first ||
          Membership.create(user_id: user&.id || user_id, client_id: client_id)
    end

    def client_id
      @client_id ||= context.client_id || params.fetch(:client_id, client_id_from_instance)
    end

    def client_id_from_instance
      case instance
      when Report
        instance.project.domain_id
      when Project
        instance.domain_id
      when Client
        instance.id
      else
        raise StandardError, "cannot set authorization for #{instance.class}"
      end
    end
  end
end
