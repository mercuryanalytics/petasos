require 'rails_helper'

# The Authorized concern is mixed into Client, Project, and Report. We exercise
# it through Client because Client's :name validation makes building fixtures
# straightforward.
RSpec.describe Authorized, type: :model do
  let(:user) { create(:user) }
  let(:other_user) { create(:user) }
  let(:client) { create(:client) }
  let(:other_client) { create(:client) }
  let(:membership) { create(:membership, user_id: user.id, client_id: client.id) }
  let(:other_membership) { create(:membership, user_id: other_user.id, client_id: other_client.id) }

  describe '.authorized_for_user' do
    it 'returns only records that have a matching authorization for the given memberships' do
      create(:client_auth, membership_id: membership.id, subject_id: client.id)
      create(:client_auth, membership_id: other_membership.id, subject_id: other_client.id)

      expect(Client.authorized_for_user([membership.id])).to contain_exactly(client)
    end

    it 'returns records authorized for any of the given memberships' do
      create(:client_auth, membership_id: membership.id, subject_id: client.id)
      create(:client_auth, membership_id: other_membership.id, subject_id: other_client.id)

      result = Client.authorized_for_user([membership.id, other_membership.id])
      expect(result).to contain_exactly(client, other_client)
    end

    it 'excludes records whose authorizations are for a different subject_class' do
      project = create(:project, client: client)
      create(:project_auth, membership_id: membership.id, subject_id: project.id)

      expect(Client.authorized_for_user([membership.id])).to be_empty
    end

    it 'falls back to all records when the membership ids list is empty' do
      # The scope returns nil for an empty list, which Rails converts into the
      # host model's default relation. This documents the current behavior so
      # any future change to this branch is caught by the spec.
      create(:client_auth, membership_id: membership.id, subject_id: client.id)

      expect(Client.authorized_for_user([])).to contain_exactly(client)
    end

    it 'returns an empty relation when no authorizations match the memberships' do
      create(:client_auth, membership_id: other_membership.id, subject_id: other_client.id)

      expect(Client.authorized_for_user([membership.id])).to be_empty
    end

    it 'scopes by the host model when included in Project' do
      project = create(:project, client: client)
      other_project = create(:project, client: other_client)
      create(:project_auth, membership_id: membership.id, subject_id: project.id)
      create(:project_auth, membership_id: other_membership.id, subject_id: other_project.id)

      expect(Project.authorized_for_user([membership.id])).to contain_exactly(project)
    end
  end
end
