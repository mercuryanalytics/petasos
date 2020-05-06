module Authorizations
  class AddAuthorizationFromParent
    include Interactor

    delegate :report, :project, :client_id, to: :context

    attr_reader :instance

    def call
      @instance = report || project || client

      klass, parent_id = parent

      return unless klass

      membership_ids = Authorization.where(subject_class: klass, subject_id: parent_id).pluck(:membership_id)

      mapped_memberships = membership_ids.map do |id|
        {
          subject_class: @instance.class.to_s,
          subject_id: @instance.id,
          membership_id: id,
          created_at: Time.zone.now,
          updated_at: Time.zone.now
        }
      end

      Authorization.insert_all(mapped_memberships)
    end

    def parent
      case instance
      when Report
        [Project, instance.project_id]
      when Project
        [Client, instance.domain_id]
      else
        [nil, nil]
      end
    end
  end
end
