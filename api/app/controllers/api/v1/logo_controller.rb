module Api
  module V1
    class LogoController < ApplicationController
      def index
        @client = Client.find_by(subdomain: params[:subdomain]) || Client.new

        render json: { data: { logo: @client.logo_url } }, status: :ok
      end
    end
  end
end
