# frozen_string_literal: true

class Ability
  include CanCan::Ability

  def initialize(user)
    # alias_action :read, :create, :update, :destroy, to: :crud
    # can :crud, Client
    # can :crud, Project
    # can :crud, Report
    # can :crud, User
    # # scopes = parse_scopes(user.permissions)
    # scopes.each do |model, permissions|
    #   if (create_permission = permissions.delete('create'))
    #     can create_permission.to_sym, model.classify.constantize
    #   end
    #   can permissions.map(&:to_sym), model.classify.constantize, id: resource_ids(model, user)
    #   # can permissions.map(&:to_sym), model.classify.constantize, account_id: user.id # researcher
    # end
  end

  def parse_scopes(permissions)
    permissions.each_with_object({}) do |scope, acc|
      perm, model = scope.split(':')

      if acc[model].nil?
        acc[model] = [perm]
      else
        acc[model] << perm
      end
    end
  end

  def resource_ids(model, user)
    "#{model.singularize.capitalize}Access"
      .constantize
      .where(account_id: user.id)
      .pluck("#{model.singularize}_id")
  end
end
