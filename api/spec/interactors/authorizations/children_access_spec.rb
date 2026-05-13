require 'rails_helper'

RSpec.describe Authorizations::ChildrenAccess do
  let!(:client) { create(:client) }
  let!(:project) { create(:project, client: client) }
  let!(:report) { create(:report, project: project) }
  let!(:user) { create(:user) }
  let!(:membership) { create(:membership, user: user, client: client) }

  describe 'success path' do
    context 'when type is Client and a descendant project is authorized for the user' do
      before do
        create(
          :authorization,
          subject_class: 'Project',
          subject_id: project.id,
          membership_id: membership.id
        )
      end

      subject(:interactor) do
        described_class.call(collection: [client], type: Client, user_id: user.id)
      end

      it 'succeeds' do
        expect(interactor).to be_a_success
      end

      it 'marks the client as having children_access' do
        interactor
        expect(client.children_access).to eq(true)
      end
    end

    context 'when type is Client and only a descendant report is authorized for the user' do
      before do
        create(
          :authorization,
          subject_class: 'Report',
          subject_id: report.id,
          membership_id: membership.id
        )
      end

      subject(:interactor) do
        described_class.call(collection: [client], type: Client, user_id: user.id)
      end

      it 'marks the client as having children_access' do
        interactor
        expect(client.children_access).to eq(true)
      end
    end

    context 'when type is Project and a descendant report is authorized for the user' do
      before do
        create(
          :authorization,
          subject_class: 'Report',
          subject_id: report.id,
          membership_id: membership.id
        )
      end

      subject(:interactor) do
        described_class.call(collection: [project], type: Project, user_id: user.id)
      end

      it 'marks the project as having children_access' do
        interactor
        expect(project.children_access).to eq(true)
      end
    end
  end

  describe 'no-access path (primary "failure" mode)' do
    context 'when no descendant authorizations exist for the user' do
      subject(:interactor) do
        described_class.call(collection: [client], type: Client, user_id: user.id)
      end

      it 'still reports success (interactor sets a flag rather than failing)' do
        expect(interactor).to be_a_success
      end

      it 'marks the client as having no children_access' do
        interactor
        expect(client.children_access).to eq(false)
      end
    end

    context 'when project has no authorized descendants' do
      subject(:interactor) do
        described_class.call(collection: [project], type: Project, user_id: user.id)
      end

      it 'marks the project as having no children_access' do
        interactor
        expect(project.children_access).to eq(false)
      end
    end
  end
end
