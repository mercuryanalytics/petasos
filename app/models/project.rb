class Project < ApplicationRecord
  include Authorized

  has_many :project_accesses
  has_many :reports, dependent: :destroy
  has_many :authorizations
  belongs_to :client, foreign_key: 'domain_id'

  COMMERCIAL_TEST         = "Commercial Test"
  CONSUMER_TEST           = "Consumer Test"
  COVER_TEST              = "Cover Test"
  MESSAGING_TEST          = "Messaging Test"
  POLITICAL_AD_TEST       = "Political Ad Test"
  PRINT_AD_TEST           = "Print Ad Test"
  TRAILER_TEST            = "Trailer Test"
  VIDEO_TEST              = "Video Test"
  WEBSITE_EVALUATION_TEST = "Website Evaluation Test"
  CUSTOM_TEST             = "Custom Test"

  PROJECT_TYPES = [
    COMMERCIAL_TEST, CONSUMER_TEST, COVER_TEST, MESSAGING_TEST, POLITICAL_AD_TEST, PRINT_AD_TEST, TRAILER_TEST,
    VIDEO_TEST, WEBSITE_EVALUATION_TEST, CUSTOM_TEST
  ]

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
