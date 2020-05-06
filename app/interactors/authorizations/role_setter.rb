module Authorizations
  class RoleSetter
    include Interactor

    delegate :params, :authorization, to: :context

    attr_reader :scopes_interactor

    def call
      return unless authorization && params.key?(:role)

      @scopes_interactor = Scopes::Role.call(role: params[:role])

      context.fail!(message: scopes_interactor.message) unless scopes_interactor.success?

      add_roles if params[:role_state].to_i == 1
      remove_roles if params[:role_state].to_i == 0
    end

    private

    def add_roles
      authorization.scopes << scopes_interactor.scopes
    end

    def remove_roles
      scopes = authorization.scopes
      authorization.scopes = scopes - scopes_interactor.scopes
    end
  end
end
