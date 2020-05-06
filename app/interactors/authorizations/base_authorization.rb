module Authorizations
  class BaseAuthorization
    include Interactor

    delegate :params, :client, :project, :report, to: :context

    def call
      if params[:authorize]
        interactor = AddAuthorization.call(
          user_id:   params[:user_id],
          client_id: params[:client_id],
          **instance
        )

        context.status = :created unless interactor.success?
        context.authorization = interactor.authorization
        return
      end

      if params.key?(:authorize) && !params[:authorize]
        interactor = RemoveAuthorization.call(
          user_id:   params[:user_id],
          client_id: params[:client_id],
          **instance
        )

        context.status = :removed unless interactor.success?
        return
      end

      context.authorization = authorization_instance
    end

    def instance
      return { report: report } if report
      return { project: project } if project
      return { client: client } if client

      context.fail!(message: 'wrong instance supplied')
    end

    def authorization_instance
      @membership ||= Membership.find_by(user_id: params[:user_id], client_id: params[:client_id])

      Authorization.find_by(
        membership_id: @membership.id,
        subject_class: subject_class,
        subject_id:    subject_id
      )
    end

    def subject_class
      (report || project || client).class.to_s
    end

    def subject_id
      (report || project || client).id
    end
  end
end
