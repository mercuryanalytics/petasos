module Reports
  class UpdateReport
    include Interactor

    delegate :report, to: :context

    def call
      context.fail!(message: client.errors) unless report.save

      report.project.update_attribute(:modified_on, report.modified_on)
    end
  end
end
