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

    if memberships.any?
      cl_ids = memberships.pluck(:client_id)
      client_authorizations(cl_ids).find_each do |client_authorization|
        access_scope = client_authorization.scopes.select { |scope| scope.action == 'access'}
        can :manage, User, memberships: { client_id: client_authorization.subject_id } if access_scope.any?
      end
    end

    return unless client_id
    return unless current_membership
    return unless current_authorization

    scopes = current_authorization&.user_scopes || []

    can :read, User, memberships: { client_id: client_id.to_i }
    scopes.each do |scope|
      can scope.action.to_sym, User, memberships: { client_id: client_id.to_i }
    end

    client_authorizations.find_each do |client_authorization|
      access_scope = client_authorization.scopes.select { |scope| scope.action == 'access'}
      can :manage, User, memberships: { client_id: client_authorization.subject_id } if access_scope.any?
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

  def client_authorizations(cl_ids = client_ids)
    @client_authorizations ||= Authorization
                                 .preload(:client_scopes)
                                 .for_clients
                                 .where(subject_id: cl_ids)
  end
end
