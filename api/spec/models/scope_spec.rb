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

    it 'reports the friendly validation message before reaching the DB constraint' do
      dup = Scope.new(scope: 'user', action: 'admin', global: true, dynamic: false)

      expect(dup).not_to be_valid
      expect(dup.errors[:action]).to include('should be unique within scope given global/dynamic')
    end
  end

  # NULLs are distinct to a unique index, so a NULL here would sit outside the
  # index above — NOT NULL is what keeps the constraint total.
  describe 'NOT NULL on the boolean flags' do
    it 'rejects a NULL global or dynamic' do
      %i[global dynamic].each do |column|
        record = build(:scope, :user, :admin, column => nil)

        expect { record.save(validate: false) }.to raise_error(ActiveRecord::NotNullViolation)
      end
    end
  end
end
