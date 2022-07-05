module Api
  module V1
    class UsersController < BaseController
      before_action :set_user, only: [:show, :update, :destroy, :authorized]

      load_and_authorize_resource except: [:create, :destroy, :researchers, :me, :update_last_login]

      def index
        users = (client_id = params[:client_id]) ?
                  User
                    .preload(:memberships)
                    .joins(:clients).where(clients: { id: client_id })
                    .accessible_by(current_ability) :
                  User.preload(:memberships).accessible_by(current_ability)

        json_response(users)
      end

      def scopes
        authorize! :authorize, current_user

        interactor = Authorizations::UserScopes.call(params: scopes_params, user: @user)

        if interactor.success?
          json_response('Scopes has been applied', :created)
          return
        end

        error_response(interactor.message)
      end

      def me
        memberships_ids = current_user.memberships.pluck(:id)

        json_response([]) && return unless memberships_ids

        auths = Authorization.preload(:scopes)
                           .preload(:dynamic_scopes)
                           .left_joins(:scopes)
                           .where(membership_id: memberships_ids)
                           .select(:id, :subject_class, :subject_id)
                           .distinct


        authorizations = auths.map do |authorization|
          [
            authorization,
            get_role_from_scopes(authorization, authorization.scopes),
            authorization.dynamic_scopes
          ]
        end

        authorizations = authorizations.group_by { |i| i.first.subject_class }.map do |k, v|
          { k.downcase => v }
        end

        client, report, project = authorizations
        global_scopes = { global: current_user.scopes }

        dynamic_scopes = {
          dynamic: auths.map { |authorization| authorization.dynamic_scopes }.flatten
        }

        json_response((client || {}).merge(report || {}).merge(project || {}).merge(global_scopes || {}).merge(dynamic_scopes))
      end

      def create
        @authorization = User.new(memberships: [Membership.new(client_id: params[:client_id])])
        authorize! :create, @authorization

        result = Users::CreateUserOrganizer.call(
          params:               user_params,
          authorization_params: authorization_params,
          no_auth:              params.fetch(:no_auth, 0),
          current_user:         current_user
        )

        if result.success?
          json_response(result.user)
        else
          error_response(result.message)
        end
      end

      def update
        result = Users::UpdateUserOrganizer.call(user: @user, params: user_params, current_user: current_user)

        if result.success?
          json_response(result.user)
        else
          error_response(result.message)
        end
      end

      def destroy
        # TODO: Check the destroy method when having scope
        result = if params.key?(:client_id) && params[:client_id]
                   Users::DeleteUserOrganizer.call(user: @user, client_id: params[:client_id])
                 else
                   Users::DeleteUserOrganizer.call(user: @user, remove_user_from_system: true)
                 end

        if result.success?
          render head: :ok
        else
          error_response(result.message)
        end
      end

      def show
        json_response(@user)
      end

      def copy
        email = params[:copy_from]
        copy_to_user = User.find(params[:id])
        copy_from_user = User.find_by(email: email)
        append = params[:append]
        return error_response('Wrong email') if copy_from_user.nil?
        return error_response('The action is forbidden for your account') unless current_user.admin?

        Users::CopyUserPermissions.call(copy_from: copy_from_user, copy_to: copy_to_user, append: append)

        render json: { email: email }
      end

      def authorized
        memberships_ids = if params[:client_id]
                            @user.memberships.select { |membership| membership.client_id == params[:client_id].to_i }.first
                          else
                            @user.memberships.pluck(:id)
                          end

        json_response([]) && return unless memberships_ids

        authorizations = Authorization
                           .preload(:scopes)
                           .preload(:dynamic_scopes)
                           .left_joins(:scopes)
                           .where(membership_id: memberships_ids)
                           .select(:id, :subject_class, :subject_id)
                           .distinct

        authorizations = authorizations.map do |authorization|
          [
            authorization,
            get_role_from_scopes(authorization, authorization.scopes),
            authorization.dynamic_scopes
          ]
        end

        authorizations = authorizations.group_by { |i| i.first.subject_class }.map do |k, v|
          { k.downcase => v }
        end

        client, report, project = authorizations
        global_scopes = { global: @user.scopes }
        json_response((client || {}).merge(report || {}).merge(project || {}).merge(global_scopes))
      end

      def researchers
        mercury_client = Client.find_by(name: 'Mercury Analytics')&.id
        current_client_ids = current_user.memberships.pluck(:client_id)

        json_response(User.for_client([mercury_client, *current_client_ids]).researchers)
      end

      def reset_password
        Users::TriggerResetPassword.call(user: current_user)

        json_response({}, 203)
      end

      def update_last_login
        context = Users::UpdateLastLogin.call(user: current_user)

        return json_response(context.last_login) if context.success?

        error_response(context.message)
      end

      private

      def user_params
        params
          .require(:user)
          .permit(
            :email, :password, :company_name, :contact_name, :contact_title, :contact_phone, :contact_fax,
            :contact_email, :mailing_address_1, :mailing_address_2, :mailing_city, :mailing_state, :mailing_zip,
            :mailing_country, :client_id
          )
      end

      def authorization_params
        params.permit(:client_id, :report_id, :project_id)
      end

      def set_user
        @user = User.find(params[:id])
      end

      def current_ability
        @current_ability = UserAbility.new(current_user, params[:client_id])
      end

      def get_role_from_scopes(authorization, scopes)
        dimension = authorization.subject_class.downcase
        roles = []
        roles << "#{dimension}_access" if scopes.map(&:action).include?('access')
        roles << "#{dimension}_admin" if scopes.map(&:action).include?('authorize')
        roles << "#{dimension}_editor" if scopes.map(&:action).include?('update')
        roles << 'viewer'
        roles
      end

      def scopes_params
        params.permit(:scope_id, :scope_state)
      end
    end
  end
end
