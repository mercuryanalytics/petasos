# frozen_string_literal: true

class AddUniqueIndexToScopes < ActiveRecord::Migration[8.1]
  # Backs the model's `validates :action, uniqueness: { scope: %i[scope global
  # dynamic] }` with a DB constraint so concurrent creates of the same quadruple
  # can't race past the Ruby-level check and insert duplicate rows.
  def change
    add_index :scopes, %i[scope action global dynamic],
              unique: true,
              name: 'index_scopes_on_scope_action_global_dynamic'
  end
end
