module Clients
  class TemplateManager
    include Interactor

    delegate :params, to: :context

    def call
      context.fail!(message: 'Not all attributes present') unless params_present?

      if state == 1
        add_authorization
        context.status = :ok

        return
      end

      if state.zero?
        remove_authorization
        context.status = :removed

        return
      end

      context.fail!(message: 'Did nothing since the state param is not recognizable')
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
