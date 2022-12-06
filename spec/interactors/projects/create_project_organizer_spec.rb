# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Projects::CreateProjectOrganizer, type: :interactor do
  let!(:client) { create(:client) }
  let!(:current_user) { create(:user, clients: [client]) }
  let!(:scopes) { create(:scope, :project, :admin) }
  let(:params) do
    {
      project: {
        name: "Schoen Maryland Democratic Primary Poll",
        project_number: "5625",
        domain_id: client.id,
        project_type: "Political Research",
        description: "View Project \"Schoen Maryland Democratic Primary Poll\"",
        account_id: 1,
        phone: "202-386-6322 x 301",
        email: "ronh@mercuryanalytics.com",
        updated_at: "2022-06-30"
      }
    }
  end
  let(:project_params) do
    ActionController::Parameters
      .new(params)
      .require(:project)
      .permit(:name, :description, :project_number, :project_type, :account_id, :domain_id)
  end

  it "exposes data errors to the UI" do
    create(:project, name: project_params[:name])
    result = Projects::CreateProjectOrganizer.call(params: project_params, user: current_user)
    pending "This should surface the error in a way that the UI can use it"
    expect(result).to be_a_success
  end
end
