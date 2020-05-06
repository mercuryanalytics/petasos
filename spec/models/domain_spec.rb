require 'rails_helper'

RSpec.describe Domain, type: :model do
  it { should belong_to :client }
end
