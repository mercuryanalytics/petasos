require 'rails_helper'

RSpec.describe Client, type: :model do
  it { should have_many :projects }
  it { should validate_presence_of :name }
end
