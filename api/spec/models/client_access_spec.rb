require 'rails_helper'

RSpec.describe ClientAccess, type: :model do
  it { should belong_to :client }
end
