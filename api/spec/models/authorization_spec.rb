require 'rails_helper'

RSpec.describe Authorization, type: :model do
  xit { should validate_presence_of :user_id }
  it { should validate_presence_of :subject_class }
  it { should validate_presence_of :subject_id }
  xit { should belong_to :user }
end
