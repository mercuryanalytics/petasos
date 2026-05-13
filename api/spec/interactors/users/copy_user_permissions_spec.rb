require 'rails_helper'

RSpec.describe Users::CopyUserPermissions do
  let!(:client) { create(:client) }
  let!(:project) { create(:project, client: client) }
  let!(:report) { create(:report, project: project) }
  let!(:scope) { create(:scope, :project, :read) }

  let!(:copy_from) { create(:user) }
  let!(:copy_to) { create(:user) }

  let!(:source_membership) { create(:membership, user_id: copy_from.id, client_id: client.id) }
  let!(:source_authorization) do
    auth = Authorization.create!(
      membership_id: source_membership.id,
      subject_class: 'Project',
      subject_id:    project.id
    )
    auth.scopes << scope
    auth
  end

  subject(:interactor) do
    described_class.call(copy_from: copy_from, copy_to: copy_to, append: append)
  end

  context 'when append is true and copy_to has no memberships' do
    let(:append) { true }

    it 'is successful' do
      expect(interactor).to be_a_success
    end

    it 'copies the membership for the source client to the target user' do
      expect { interactor }.to change { Membership.where(user_id: copy_to.id).count }.by(1)
    end

    it 'copies the authorization onto the new membership' do
      interactor
      target_membership = Membership.find_by(user_id: copy_to.id, client_id: client.id)
      expect(target_membership.authorizations.count).to eq(1)
      expect(target_membership.authorizations.first.subject_class).to eq('Project')
      expect(target_membership.authorizations.first.subject_id).to eq(project.id)
    end

    it 'copies the scopes onto the new authorization' do
      interactor
      target_auth = Membership.find_by(user_id: copy_to.id, client_id: client.id).authorizations.first
      expect(target_auth.scopes).to include(scope)
    end
  end

  context 'when append is false and copy_to has pre-existing memberships' do
    let(:append) { false }
    let!(:other_client) { create(:client) }
    let!(:target_membership) { create(:membership, user_id: copy_to.id, client_id: other_client.id) }
    let!(:target_authorization) do
      auth = Authorization.create!(
        membership_id: target_membership.id,
        subject_class: 'Client',
        subject_id:    other_client.id
      )
      auth.scopes << scope
      auth
    end

    it 'is successful' do
      expect(interactor).to be_a_success
    end

    it 'removes pre-existing memberships before copying' do
      interactor
      expect(Membership.where(user_id: copy_to.id, client_id: other_client.id)).to be_empty
    end

    it 'copies the source memberships to copy_to' do
      interactor
      expect(Membership.find_by(user_id: copy_to.id, client_id: client.id)).not_to be_nil
    end
  end
end
