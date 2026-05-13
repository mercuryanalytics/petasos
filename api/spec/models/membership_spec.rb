require 'rails_helper'

RSpec.describe Membership, type: :model do
  it { should belong_to :user }
  it { should belong_to :client }
  it { should have_many(:authorizations).dependent(:destroy) }
  it { should have_many(:clients_authorizations).class_name('Authorization') }

  describe 'associations' do
    let(:user) { create(:user) }
    let(:client) { create(:client) }

    it 'is valid with a user and a client' do
      membership = build(:membership, user_id: user.id, client_id: client.id)
      expect(membership).to be_valid
    end

    it 'is invalid without a user' do
      membership = build(:membership, user_id: nil, client_id: client.id)
      expect(membership).not_to be_valid
    end

    it 'is invalid without a client' do
      membership = build(:membership, user_id: user.id, client_id: nil)
      expect(membership).not_to be_valid
    end
  end

  describe '#authorizations' do
    let(:user) { create(:user) }
    let(:client) { create(:client) }
    let(:membership) { create(:membership, user_id: user.id, client_id: client.id) }

    it 'destroys associated authorizations when the membership is destroyed' do
      create(:client_auth, membership_id: membership.id, subject_id: client.id)
      expect { membership.destroy }.to change { Authorization.count }.by(-1)
    end
  end

  describe '#clients_authorizations' do
    let(:user) { create(:user) }
    let(:client) { create(:client) }
    let(:project) { create(:project, client: client) }
    let(:membership) { create(:membership, user_id: user.id, client_id: client.id) }

    it 'returns only authorizations whose subject_class is Client' do
      client_auth = create(:client_auth, membership_id: membership.id, subject_id: client.id)
      create(:project_auth, membership_id: membership.id, subject_id: project.id)

      expect(membership.clients_authorizations).to contain_exactly(client_auth)
    end

    it 'returns an empty collection when no client authorizations exist' do
      create(:project_auth, membership_id: membership.id, subject_id: project.id)

      expect(membership.clients_authorizations).to be_empty
    end
  end
end
