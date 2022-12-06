class RemoveUnusedScopes < ActiveRecord::Migration[6.0]
  def change
    Scope.global.where(name: nil).destroy_all
    Scope.dynamic.where(name: nil).destroy_all
  end
end
