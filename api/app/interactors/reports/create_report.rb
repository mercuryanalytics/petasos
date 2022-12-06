module Reports
  class CreateReport
    include Interactor

    delegate :report, to: :context

    def call
      context.fail!(message: report.errors) unless report.save
    end

    def rollback
      report.destroy
    end
  end
end
