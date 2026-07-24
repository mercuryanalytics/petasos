# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Scope, type: :model do
  describe 'DB-level uniqueness on (scope, action, global, dynamic)' do
    before do
      create(:scope, scope: 'user', action: 'admin', global: true, dynamic: false)
    end

    it 'rejects a duplicate quadruple even when model validation is bypassed' do
      dup = Scope.new(scope: 'user', action: 'admin', global: true, dynamic: false)

      expect { dup.save(validate: false) }.to raise_error(ActiveRecord::RecordNotUnique)
    end

    it 'allows the same (scope, action) pair when global differs' do
      other = Scope.new(scope: 'user', action: 'admin', global: false, dynamic: false)

      expect { other.save(validate: false) }.not_to raise_error
    end
  end
end
