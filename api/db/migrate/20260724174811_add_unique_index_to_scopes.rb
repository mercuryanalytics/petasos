# frozen_string_literal: true

class AddUniqueIndexToScopes < ActiveRecord::Migration[8.1]
  # Backs the model's `validates :action, uniqueness: { scope: %i[scope global
  # dynamic] }` with a DB constraint so concurrent creates of the same quadruple
  # can't race past the Ruby-level check and insert duplicate rows.
  #
  # Postgres treats NULLs as distinct in a unique index, so nullable columns
  # leave rows outside the constraint. 20260724212444 closes that for
  # `global`/`dynamic` (4 prod rows had NULL `dynamic`). `scope`/`action` stay
  # nullable — zero NULLs in prod, but no NOT NULL and no presence validation,
  # so add both (or `nulls_not_distinct: true`, PG 15+) if that changes.
  def change
    add_index :scopes, %i[scope action global dynamic],
              unique: true,
              name: 'index_scopes_on_scope_action_global_dynamic'
  end
end
