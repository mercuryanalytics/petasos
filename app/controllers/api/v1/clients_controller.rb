module Api
  module V1
    class ClientsController < BaseController
      before_action :set_client, only: [:show, :update, :destroy]

      load_and_authorize_resource

      def index
        @clients = Client.accessible_by(current_ability).all

        json_response(@clients)
      end

      def show
        json_response(@client)
      end

      def create
        context = Clients::CreateClientOrganizer.call(params: client_params, user: current_user)

        return json_response(context.client, :created) if context.success?

        error_response(context.message)
      end

      def update
        context = Clients::UpdateClientOrganizer.call(params: client_params, client: @client)

        return json_response(context.client) if context.success?

        error_response(context.message)
      end

      def destroy
        context = Clients::RemoveClientOrganizer.call(client: @client)

        return render head: :ok if context.success?

        error_response('Could not remove!')
      end

      def orphans
        result = Reports::OrphanPerClient.call(user: current_user)

        if result.success?
          json_response(result.reports)
          return
        end

        error_response('Something went wrong, check logs')
      end

      def authorize
        base_authorization = Authorizations::BaseAuthorization.call(
          params: authorize_params.to_h,
          client: Client.find(params[:id])
        )

        render error_response(base_authorization.message) && return unless base_authorization.success?

        status = base_authorization.status == :ok ? :created : :no_content
        authorization = base_authorization.authorization

        return head status unless current_user.admin? && authorization

        role_interactor = Authorizations::RoleSetter.call(
          params: authorize_params.to_h,
          authorization: authorization
        )

        render error_response(role_interactor.message) && return unless role_interactor.success?

        dynamic_scopes_interactor = Authorizations::DynamicScope.call(
          params: authorize_params.to_h,
          authorization: authorization
        )

        render error_response(dynamic_scopes_interactor.message) && return unless dynamic_scopes_interactor.success?

        head :ok
      end

      def authorized
        membership_ids = Authorization.where(
          subject_class: 'Client', subject_id: params[:id]
        ).pluck(:membership_id)

        users = if params[:client_id]
                  User.includes(:memberships).for_client(params[:client_id]).find_each.collect do |user|
                    user.authorized = (user.membership_ids & membership_ids).any?
                    user
                  end
                else
                  User.includes(:memberships).find_each.collect do |user|
                    user.authorized = (user.membership_ids & membership_ids).any? ?
                                        Membership.where(id: (user.membership_ids & membership_ids)).pluck(:client_id) :
                                        []
                    user
                  end
                end

        json_response(users)
      end

      private

      def set_client
        @client = Client.find(params[:id])
      end

      def client_params
        params.require(:client).permit(
          :name, :uuid, :company_name, :contact_type, :contact_name, :contact_title,
          :contact_phone, :contact_fax, :contact_email, :mailing_address_1, :mailing_address_2, :mailing_city,
          :mailing_state, :mailing_zip, :billing_address_1, :billing_address_2, :billing_city, :billing_state,
          :billing_zip, :mailing_country, :billing_country, :default_template_enabled, :slogan, :logo, :subdomain
        )
      end

      def current_ability
        @current_ability ||= ::ClientAbility.new(current_user, params[:id])
      end

      def authorize_params
        params.permit(:user_id, :client_id,  :authorize, :role, :role_state, :scope_id, :scope_state)
      end
    end
  end
end
