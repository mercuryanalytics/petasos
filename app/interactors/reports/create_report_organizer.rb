module Reports
  class CreateReportOrganizer
    include Interactor::Organizer

    organize ValidateReport, CreateReport, Authorizations::AddAuthorization
  end
end
