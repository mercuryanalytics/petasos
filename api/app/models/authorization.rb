class Authorization < ApplicationRecord
  belongs_to :user, optional: true
  belongs_to :membership, optional: true
  belongs_to :client, optional: true
  has_and_belongs_to_many :scopes, dependent: :destroy
  has_and_belongs_to_many :client_scopes, -> { for_client }, class_name: 'Scope'
  has_and_belongs_to_many :domain_scopes, -> { for_domain }, class_name: 'Scope'
  has_and_belongs_to_many :user_scopes, -> { for_user }, class_name: 'Scope'
  has_and_belongs_to_many :project_scopes, -> { for_project }, class_name: 'Scope'
  has_and_belongs_to_many :report_scopes, -> { for_report }, class_name: 'Scope'
  has_and_belongs_to_many :dynamic_scopes, -> { dynamic }, class_name: 'Scope'

  validates :subject_class, presence: true, inclusion: { in: %w(Client User Project Report) }
  validates :subject_id, presence: true

  scope :for_clients, -> { where(subject_class: 'Client') }
  scope :for_projects, -> { where(subject_class: 'Project') }
  scope :for_reports, -> { where(subject_class: 'Report') }
end
