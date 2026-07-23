# frozen_string_literal: true

class AddBrandLiftBenchmarksGlobalScope < ActiveRecord::Migration[8.1]
  def up
    Scope.find_or_create_by!(action: 'brand_lift_benchmarks', scope: 'user', global: true) do |s|
      s.name = 'Brand Lift Benchmarks'
      s.description = 'Access to the brand lift benchmark tool in workbench'
    end
  end

  def down
    Scope.where(action: 'brand_lift_benchmarks', scope: 'user', global: true).destroy_all
  end
end
