# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Projects::RemoveProjectOrganizer, type: :interactor do
  let!(:client) { create(:client) }
  let!(:user) { create(:user, clients: [client]) }
  let!(:membership) { user.memberships.first }
  let!(:project) { create(:project, client: client) }
  let!(:authorization) do
    create(
      :project_auth,
      subject_id: project.id,
      client_id: client.id,
      membership_id: membership.id
    )
  end

  describe 'success path' do
    subject(:result) do
      described_class.call(project: project, membership_id: membership.id)
    end

    it 'is successful' do
      expect(result).to be_a_success
    end

    it 'destroys the project' do
      expect { result }.to change(Project, :count).by(-1)
    end

    it 'removes matching project authorizations' do
      expect { result }.to change(Authorization, :count).by(-1)
    end
  end

  describe 'failure path' do
    context 'when the project context is missing' do
      it 'fails when delegating interactors cannot find an instance' do
        expect {
          described_class.call(membership_id: membership.id)
        }.to raise_error(NoMethodError)
      end
    end
  end
end
