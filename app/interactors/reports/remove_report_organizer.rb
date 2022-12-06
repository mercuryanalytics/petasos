module Reports
  class RemoveReportOrganizer
    include Interactor::Organizer

    organize Authorizations::RemoveAuthorization, RemoveReport
  end
end
