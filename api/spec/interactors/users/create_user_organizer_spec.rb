require 'rails_helper'

RSpec.describe Users::CreateUserOrganizer do
  let!(:client) { create(:client) }
  let(:email) { 'new.member@example.com' }
  let(:params) { { email: email, contact_name: 'New Member', client_id: client.id } }
  let(:authorization_params) { ActiveSupport::HashWithIndifferentAccess.new('client_id' => client.id) }
  let!(:current_user) { create(:user) }

  subject(:interactor) do
    described_class.call(
      params:               params,
      authorization_params: authorization_params,
      current_user:         current_user,
      client_id:            client.id,
      no_auth:              1
    )
  end

  before do
    # No external HTTP allowed; intercept the Auth0-touching sub-interactor.
    allow(Users::CreateAuth0User).to receive(:call!) do |context|
      context.auth_id = 'auth0|stubbed'
      context
    end
    allow(Authorizations::AddClientDefaultAuthorizations).to receive(:call!) { |c| c }
    ActionMailer::Base.deliveries.clear
  end

  context 'with a valid new user' do
    it 'is successful' do
      expect(interactor).to be_a_success
    end

    it 'creates a new user record' do
      expect { interactor }.to change { User.count }.by(1)
    end

    it 'attaches the user to the supplied client' do
      interactor
      created = User.find_by(email: email)
      expect(created.clients).to include(client)
    end

    it 'sends the invitation email to the new user' do
      expect { interactor }.to change { ActionMailer::Base.deliveries.size }.by(1)
      expect(ActionMailer::Base.deliveries.last.to).to include(email)
    end
  end

  context 'when validation fails (primary failure mode)' do
    before do
      allow_any_instance_of(User).to receive(:valid?).and_return(false)
    end

    it 'is a failure' do
      expect(interactor).to be_a_failure
    end

    it 'does not create the user' do
      expect { interactor }.not_to change { User.count }
    end
  end
end
