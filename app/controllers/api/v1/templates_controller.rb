module Api
  module V1
    class TemplatesController < BaseController
      before_action { authorize! :authorize, Client, id: params[:client_id] }

      def index
        @client = Client.preload(:authorizations, projects: :reports).find(params[:client_id])

        json_response(
          ::V1::DefaultTemplate::ClientSerializer.new(
            @client,
            scope:      @client.authorizations,
            scope_name: :authorizations
          )
        )
      end

      def create
        interactor = Clients::TemplateManager.call(params: template_params)

        error_response(interactor.message) && return unless interactor.success?

        head :no_content && return if interactor.status == :removed

        head :ok
      end

      def template_params
        params.permit(:client_id, :resource_type, :resource_id, :state)
      end

      def current_ability
        @current_ability ||= ClientAbility.new(current_user, params[:client_id])
      end
    end
  end
end
