class UserAbility
  include CanCan::Ability

  attr_reader :user, :client_id

  def initialize(user, client_id = nil)
    @user      = user
    @client_id = client_id

    if user.admin?
      can :manage, :all
      return
    end

    can [:read, :update, :authorized], User, id: user.id

    return unless client_id
    return unless current_membership
    return unless current_authorization

    scopes = current_authorization&.user_scopes

    return unless scopes.any?

    can :read, User, memberships: { client_id: client_id.to_i }
    scopes.each do |scope|
      can scope.action.to_sym, User, memberships: { client_id: client_id.to_i }
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
    @current_authorization ||= current_membership.clients_authorizations.where(subject_id: client_id).first
  end
end
