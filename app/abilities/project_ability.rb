class ProjectAbility
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
    can :view, Project, id: project_ids

    projects_authorizations.find_each do |project_authorization|
      project_authorization.project_scopes.each do |scope|
        if scope.action == 'create' && scope.scope == 'project'
          project = projects.select { |project| project.id == project_authorization.subject_id }.first
          can :create, Project, domain_id: project.domain_id

          next
        end
        can scope.action.to_sym, Project, id: project_authorization.subject_id
      end
    end

    # Client manager role has the create / edit all projects scopes
    client_authorizations.find_each do |client_authorization|
      can :view, Project, domain_id: client_authorization.subject_id
      client_authorization.project_scopes.each do |scope|
        can scope.action.to_sym, Project, domain_id: client_authorization.subject_id
      end
    end
  end

  def project_ids
    return [] if memberships.empty?

    @project_ids ||= Project.authorized_for_user(memberships.map(&:id)).pluck(:id).uniq
  end

  def projects
    @projects ||= Project.where(id: project_ids)
  end

  def memberships
    @memberships ||= user.memberships
  end

  def projects_authorizations
    @project_authorizations ||= Authorization
                                  .preload(:project_scopes)
                                  .for_projects
                                  .joins(:membership)
                                  .where(memberships: { user_id: user.id })
                                  .where(subject_id: project_ids)
  end

  def client_authorizations
    @client_authorizations ||= Authorization
                                 .preload(:project_scopes)
                                 .joins(:project_scopes)
                                 .joins(:membership)
                                 .where(memberships: { user_id: user.id })
                                 .for_clients
                                 .where(subject_id: client_id)
  end
end
