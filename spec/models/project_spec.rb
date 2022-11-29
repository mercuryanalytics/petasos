require 'rails_helper'

RSpec.describe Project, type: :model do
  it { should have_many(:project_accesses) }
  it { should validate_presence_of :name }
  it { should have_many :reports }
  it { should belong_to :client }
  xit { should validate_uniqueness_of(:name).scoped_to(:client) }
end
