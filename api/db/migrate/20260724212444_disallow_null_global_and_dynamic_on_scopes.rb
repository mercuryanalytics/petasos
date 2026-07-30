# frozen_string_literal: true

class DisallowNullGlobalAndDynamicOnScopes < ActiveRecord::Migration[8.1]
  # `global`/`dynamic` have carried `default: false` since 20200414123236, so
  # every code path writes a boolean — but four rows hand-created in a prod
  # console (the `workbench` global scopes) carry NULL `dynamic`. Postgres
  # treats NULLs as distinct in a unique index, so those rows sit *outside*
  # index_scopes_on_scope_action_global_dynamic: the DB constraint added in
  # 20260724174811 is weaker there than the model validation it backs.
  #
  # Backfill to the column default, then make the hole unreachable. Verified
  # against prod: 4 rows to update, 0 collisions with existing `dynamic: false`
  # rows, so the backfill can't violate the unique index.
  def up
    execute 'UPDATE scopes SET dynamic = false WHERE dynamic IS NULL'
    change_column_null :scopes, :dynamic, false
    change_column_null :scopes, :global, false
  end

  def down
    change_column_null :scopes, :global, true
    change_column_null :scopes, :dynamic, true
  end
end
