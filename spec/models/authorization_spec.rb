require 'rails_helper'

RSpec.describe Authorization, type: :model do
  # it { is_expected.to validate_presence_of :user_id }
  it { is_expected.to validate_presence_of :subject_class }
  it { is_expected.to validate_presence_of :subject_id }
  # it { is_expected.to belong_to :user }
end
