module Reports
  class UpdateReportOrganizer
    include Interactor::Organizer

    organize ValidateReport, UpdateReport
  end
end
