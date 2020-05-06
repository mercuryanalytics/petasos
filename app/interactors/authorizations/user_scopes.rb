module Authorizations
  class UserScopes
    include Interactor

    delegate :user, :params, to: :context

    attr_reader :scope

    def call
      return unless user && params.key?(:scope_id)

      @scope = Scope.find(params[:scope_id])
      context.fail!(message: 'Wrong scope type for the given resource') unless appliable_scope?

      add_scope if params[:scope_state].to_i == 1
      remove_scope if params[:scope_state].to_i.zero?
    end

    def add_scope
      user.scopes << scope
    end

    def remove_scope
      scopes = user.scopes

      user.scopes = scopes - [scope]
    end

    def appliable_scope?
      scope.global
    end
  end
end
