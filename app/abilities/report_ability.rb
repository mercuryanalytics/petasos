class ReportAbility
  include CanCan::Ability

  attr_reader :user, :project_id

  def initialize(user, project_id = nil)
    @user = user
    @project_id = project_id

    if user.admin?
      can :manage, :all
      return
    end

    alias_action :read, :orphans, to: :view
    can :view, Report, id: report_ids

    report_authorization.find_each do |authorization|
      authorization.scopes.each do |scope|
        can scope.action.to_sym, Report, id: authorization.subject_id
      end
    end

    client_authorizations.find_each do |client_authorization|
      project_ids = client_project_ids(client_authorization.subject_id)

      client_authorization.scopes.each do |scope|
        if scope.action == 'access'
          can :view, Report, project_id: project_ids
        end

        if scope.action == 'update'
          can :create, report, project_id: project_ids
          can :update, Report, project_id: project_ids
        end

        if scope.action == 'authorize'
          can :manage, Report, project_id: project_ids
        end
      end
    end

    return unless project_id

    projects_authorizations.find_each do |authorization|
      authorization.scopes.each do |scope|
        if scope.action == 'access'
          can :view, Report, project_id: authorization.subject_id
        end

        if scope.action == 'update'
          can :create, Report, project_id: authorization.subject_id
          can :update, Report, project_id: authorization.subject_id
        end

        if scope.action == 'authorize'
          can :manage, Report, project_id: authorization.subject_id
        end
      end
    end
  end

  def project_ids
    @project_ids ||= Project.authorized_for_user(user.memberships.map(&:id)).pluck(:id)
  end

  def report_authorization
    @report_authorization ||=
      Authorization
        .preload(:scopes)
        .joins(:scopes)
        .joins(:membership)
        .where(memberships: { user_id: user.id })
        .for_reports
        .where(subject_id: report_ids)
  end

  def projects_authorizations
    @project_authorizations ||=
      Authorization
        .preload(:scopes)
        .joins(:scopes)
        .joins(:membership)
        .where(memberships: { user_id: user.id })
        .for_projects
        .where(subject_id: project_id)
  end

  def report_ids
    return [] if memberships.empty?

    @report_ids ||= Report.authorized_for_user(user.memberships.map(&:id)).pluck(:id)
  end

  def memberships
    @memberships ||= user.memberships
  end

  def client_authorizations
    @client_authorizations ||= Authorization.preload(:scopes).joins(:membership).where(memberships: { user_id: user.id })
  end

  def client_project_ids(client_id)
    Project.where(domain_id: client_id).pluck(:id)
  end
end
