class Report < ApplicationRecord
  include Authorized
  belongs_to :project, touch: true

  validates :name, presence: true

  def as_json(options = {})
    super.merge(project: self.project)
  end
end
