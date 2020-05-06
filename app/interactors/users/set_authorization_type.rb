module Users
  class SetAuthorizationType
    include Interactor

    delegate :authorization_params, to: :context

    def call
      params = authorization_params.reject { |_, v| v.blank? }

      if params.key?('report_id')
        context.report = Report.find(authorization_params[:report_id])
        return
      end

      if params.key?('project_id')
        context.project = Project.find(authorization_params[:project_id])
        return
      end

      if params.key?('client_id')
        context.client = Client.find(authorization_params[:client_id])
      end
    end
  end
end
