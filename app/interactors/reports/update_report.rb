module Reports
  class UpdateReport
    include Interactor

    delegate :report, to: :context

    def call
      context.fail!(message: client.errors) unless report.save
    end
  end
end
