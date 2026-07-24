# frozen_string_literal: true

class DropBiometricsAccessGlobalScope < ActiveRecord::Migration[8.1]
  def up
    # NBCU biometrics tool is retired; destroy cascades the scopes_users join rows.
    Scope.where(action: 'access_biometrics', scope: 'clients', global: true).destroy_all
  end

  def down
    Scope.find_or_create_by!(action: 'access_biometrics', scope: 'clients', global: true) do |s|
      s.name = 'Biometrics Access'
      s.description = 'Can use the NBCU biometrics tool'
    end
  end
end
