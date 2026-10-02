# frozen_string_literal: true

class Project < ApplicationRecord
  include Authorized

  has_many :project_accesses, dependent: nil
  has_many :reports, dependent: :destroy
  belongs_to :client, foreign_key: 'domain_id', inverse_of: :projects

  # rubocop:disable Rails/UniqueValidationWithoutIndex -- the index needs a migration and a prod duplicate check
  validates :name, presence: true, uniqueness: { scope: :domain_id, case_sensitive: true }
  # rubocop:enable Rails/UniqueValidationWithoutIndex

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
