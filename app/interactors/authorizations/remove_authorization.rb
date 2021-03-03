module Authorizations
  class RemoveAuthorization
    include Interactor

    delegate :client, :project, :report, :user, :user_id, :membership_id, :client_id, :from_admin, to: :context

    def call
      instance = client || project || report

      return unless membership_id

      # context.fail!(message: 'no authorization found') unless membership_id

      query = {
        subject_class: instance&.class&.to_s,
        subject_id: instance&.id,
        membership_id: membership_id
      }.reject { |_, value| value.blank? }

      Authorization.where(query).destroy_all
    end
  end
end
