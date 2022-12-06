module Reports
  class ValidateReport
    include Interactor

    delegate :params, to: :context

    def call
      report = context.report || Report.new
      report.assign_attributes(params)

      report.valid? ? context.report = report : context.fail!(message: report.errors)
    end
  end
end
