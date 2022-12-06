require 'rails_helper'

RSpec.describe Report, type: :model do
  it { should belong_to :project }
  it { should validate_presence_of :name }
end
