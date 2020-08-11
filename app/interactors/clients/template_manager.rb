module Clients
  class TemplateManager
    include Interactor

    delegate :params, to: :context

    def call
      context.fail!(message: 'Not all attributes present') unless params_present?

      if state == 1
        add_authorization
        context.status = :ok
      end

      if state.zero?
        remove_authorization
        context.status = :removed
      end

      if params[:role]
        interactor = Scopes::Role.call(role: params[:role])
        authorization.scopes << interactor.scopes if params[:role_state] == 1
        authorization.scopes = authorization.scopes - interactor.scopes if params[:role_state] == 0
      end
    end

    def params_present?
      %i(client_id resource_type resource_id state).collect { |param| params.key?(param) }.all?
    end

    def add_authorization
      authorization.save! if authorization.new_record?
    end

    def remove_authorization
      return if authorization.new_record?

      authorization.destroy
    end

    def state
      params[:state].to_i
    end

    def authorization
      @authorization ||= Authorization.find_or_initialize_by(
        subject_class: params[:resource_type].capitalize,
        subject_id: params[:resource_id],
        client_id: params[:client_id]
      )
    end
  end
end
