module Authorizations
  class DynamicScope
    include Interactor

    delegate :authorization, :params, to: :context

    attr_reader :scope

    def call
      return unless authorization && params.key?(:scope_id)

      @scope = Scope.find(params[:scope_id])
      context.fail!(message: 'Wrong scope type for the given resource') unless appliable_scope?

      add_scope if params[:scope_state].to_i == 1
      remove_scope if params[:scope_state].to_i.zero?
    end

    def add_scope
      authorization.scopes << scope
    end

    def remove_scope
      scopes = authorization.scopes

      authorization.scopes = scopes - [scope]
    end

    def appliable_scope?
      authorization.subject_class.downcase.pluralize == scope.scope
    end
  end
end
