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

    return unless project_id

    projects_authorizations.find_each do |authorization|
      authorization.scopes.each do |scope|
        next unless scope.scope == 'report'
        can scope.action.to_sym, Report, project_id: authorization.subject_id
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
end
