require 'rails_helper'

RSpec.describe Project, type: :model do
  it { is_expected.to have_many(:project_accesses) }
  it { is_expected.to validate_presence_of :name }
  # it { is_expected.to validate_uniqueness_of :name }
  it { is_expected.to have_many :reports }
  it { is_expected.to belong_to :client }
end
