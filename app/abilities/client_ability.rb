class ClientAbility
  include CanCan::Ability

  attr_reader :user, :client_id

  def initialize(user, client_id = nil)
    @user      = user
    @client_id = client_id

    if user.admin?
      can :manage, :all
      return
    end

    alias_action :read, :orphans, to: :view
    can :view, Client, id: client_ids

    return unless client_id
    return unless current_membership
    return unless current_authorization

    scopes = current_authorization.client_scopes

    scopes.each do |scope|
      if scope.action == 'access'
        can :manage, Client, id: client_ids
      end
      can scope.action.to_sym, Client, id: client_ids
    end
  end

  def client_ids
    return [] if memberships.empty?

    @client_ids ||= Client.authorized_for_user(memberships.map(&:id)).pluck(:id)
  end

  def memberships
    @memberships ||= user.memberships
  end

  def current_membership
    return unless client_id
    @current_membership ||= memberships.select { |membership|  membership.client_id == client_id.to_i }.first
  end

  def current_authorization
    current_membership.clients_authorizations.where(subject_id: client_id).first
  end
end
