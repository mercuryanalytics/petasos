module Reports
  class RemoveReport
    include Interactor

    delegate :report, to: :context

    def call
      report.destroy
    end
  end
end
