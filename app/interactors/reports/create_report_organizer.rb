module Reports
  class CreateReportOrganizer
    include Interactor::Organizer

    organize ValidateReport, CreateReport, Authorizations::AddAuthorization,
             Authorizations::AddAuthorizationFromParent
  end
end
