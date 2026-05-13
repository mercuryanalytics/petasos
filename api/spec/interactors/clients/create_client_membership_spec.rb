require 'rails_helper'

RSpec.describe Clients::CreateClientMembership do
  subject(:interactor) { described_class.call(client: client, user: user) }

  describe 'with a persisted client and user' do
    let!(:client) { create(:client) }
    let!(:user) { create(:user) }

    it 'is successful' do
      expect(interactor).to be_a_success
    end

    it 'creates a membership linking the user to the client' do
      expect { interactor }.to change { Membership.count }.by(1)
      membership = Membership.last
      expect(membership.user_id).to eq(user.id)
      expect(membership.client_id).to eq(client.id)
    end

    context 'when a membership already exists' do
      let!(:existing) { Membership.create!(user: user, client: client) }

      it 'is still successful' do
        expect(interactor).to be_a_success
      end

      it 'does not create a duplicate membership' do
        expect { interactor }.not_to change { Membership.count }
      end
    end
  end

  describe 'when the membership cannot be saved' do
    let!(:client) { create(:client) }
    let!(:user) { create(:user) }

    before do
      allow(Membership).to receive(:find_or_initialize_by).and_wrap_original do |original, *args|
        membership = original.call(*args)
        allow(membership).to receive(:save).and_return(false)
        allow(membership).to receive(:errors).and_return('membership invalid')
        membership
      end
    end

    it 'is a failure' do
      expect(interactor).to be_a_failure
    end

    it 'exposes the membership errors as the message' do
      expect(interactor.message).to eq('membership invalid')
    end
  end
end
