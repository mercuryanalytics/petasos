# frozen_string_literal: true

class MoveBrandLiftBenchmarksScopeToWorkbench < ActiveRecord::Migration[8.1]
  # Talaria's Ability matches a global scope on (scope, action), not action alone
  # (app/models/ability.rb, PERMISSIONS_MAP[:cn_brand_lift_benchmark]). It looks for
  # scope 'workbench' -- as do the other four talaria global scopes -- so the 'user'
  # row created by 20260723184824 was never visible there and the benchmark tool
  # stayed hidden for everyone but mercury_user.
  #
  # update_all rather than destroy/recreate: it keeps the scopes_users assignments,
  # so users already granted the flag keep it.
  def up
    Scope.where(action: 'brand_lift_benchmarks', scope: 'user', global: true).update_all(scope: 'workbench')
  end

  def down
    Scope.where(action: 'brand_lift_benchmarks', scope: 'workbench', global: true).update_all(scope: 'user')
  end
end
