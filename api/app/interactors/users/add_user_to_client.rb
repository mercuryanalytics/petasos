module Users
  class AddUserToClient
    include Interactor

    delegate :params, :user, :authorization_params, to: :context

    def call
      return unless authorization_params[:client_id]

      client = Client.find(authorization_params[:client_id])
      context.fail!(message: 'Client does not exist') unless client

      user.clients << client unless user.clients.include?(client)
    end
  end
end
