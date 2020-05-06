class DomainAbility
  include CanCan::Ability

  attr_reader :user, :client_id

  def initialize(user, client_id = nil)
    @user      = user
    @client_id = client_id

    if user.admin?
      can :manage, :all
      return
    end

    scopes = current_authorization&.domain_scopes
    return unless current_authorization
    return unless scopes.any?

    can :read, Domain, client_id: client_ids if scopes.any?

    scopes.each do |scope|
      can scope.action.to_sym, Domain, client_id: client_ids
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
