module Clients
  class ValidateClient
    include Interactor

    delegate :params, to: :context

    def call
      client = context.client || Client.new
      client.assign_attributes(params.except(:logo))
      client.logo = { data: params[:logo] } if params[:logo].present?

      client.valid? ? context.client = client : context.fail!(message: client.errors)
    end
  end
end
