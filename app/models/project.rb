class Project < ApplicationRecord
  include Authorized

  has_many :project_accesses
  has_many :reports, dependent: :destroy
  has_many :authorizations
  belongs_to :client, foreign_key: 'domain_id'

  validates :name, presence: true, uniqueness: { case_sensitive: true }

  before_create :default_project_type, if: -> { project_type.nil? }

  attr_accessor :children_access

  def as_json(options = {})
    super.merge(children_access: children_access)
  end
  
  private

  def default_project_type
    self.project_type = "Custom Research"
  end
end
