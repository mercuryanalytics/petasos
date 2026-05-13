require 'rails_helper'

RSpec.describe Reports::OrphanPerClient, type: :interactor do
  let!(:client) { create(:client) }

  subject(:interactor) { described_class.call(user: user, client_id: client.id) }

  context 'when the user is an admin' do
    let!(:user) { create(:user, scopes: [create(:scope, :user, :admin)]) }

    it 'is successful' do
      expect(interactor).to be_a_success
    end

    it 'short-circuits and returns no orphan reports' do
      expect(interactor.reports).to eq([])
    end
  end

  context 'when the user has an access-scoped authorization on the client (early-return path)' do
    let!(:user) { create(:user, clients: [client]) }
    let!(:client_authorization) do
      authorization = Authorization.create!(
        subject_class: 'Client',
        subject_id: client.id,
        membership_id: user.memberships.first.id,
        client_id: client.id
      )
      authorization.client_scopes << create(:scope, :client, :read).tap { |s| s.update!(action: 'access') }
      authorization
    end

    it 'is successful' do
      expect(interactor).to be_a_success
    end

    it 'short-circuits and returns no orphan reports' do
      expect(interactor.reports).to eq([])
    end
  end

  context 'when the user has neither admin nor access/authorize on the client (primary computed path)' do
    let!(:user) { create(:user, clients: [client]) }

    it 'is successful' do
      expect(interactor).to be_a_success
    end

    it 'exposes a (possibly empty) collection of reports on context.reports' do
      expect(interactor.reports).to respond_to(:each)
    end
  end
end
