module Api
  module V1
    class DomainsController < BaseController
      before_action :set_domain, only: %i(show update destroy)

      load_and_authorize_resource except: [:create]

      def index
        domains = Domain.where(client_id: params[:client_id]).accessible_by(current_ability)

        json_response(domains)
      end

      def create
        @domain = Domain.new(domain_params.merge(client_id: params[:client_id]))
        authorize!(:create, @domain)

        if @domain.save
          json_response(@domain)
        else
          error_response(@domain.errors)
        end
      end

      def show
        json_response(@domain)
      end

      def update
        @domain.assign_attributes(domain_params)

        if @domain.save
          json_response(@domain)
        else
          error_response(@domain.errors)
        end
      end

      def destroy
        @domain.destroy
      end

      private

      def domain_params
        params.require(:domain).permit(:name)
      end

      def set_domain
        @domain = Domain.where(client_id: params[:client_id]).find(params[:id])
      end

      def current_ability
        @current_ability ||= DomainAbility.new(current_user, params[:client_id])
      end
    end
  end
end
