class Scope < ApplicationRecord
  has_and_belongs_to_many :users, dependent: :destroy
  has_and_belongs_to_many :authorizations, dependent: :destroy

  scope :for_client, -> { where(scope: 'client') }
  scope :for_domain, -> { where(scope: 'domain') }
  scope :for_user, -> { where(scope: 'user') }
  scope :for_project, -> { where(scope: 'project') }
  scope :for_report, -> { where(scope: 'report') }
  scope :global, -> { where(global: true) }
  scope :dynamic, -> { where(dynamic: true) }
  scope :data_level, -> { where(global: false, dynamic: false) }
end
