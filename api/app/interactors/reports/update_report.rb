# frozen_string_literal: true

module Reports
  class UpdateReport
    include Interactor

    delegate :report, to: :context

    def call
      context.fail!(message: report.errors) unless report.save
    end
  end
end
