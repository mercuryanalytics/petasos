# frozen_string_literal: true

class Client < ApplicationRecord
  include Authorized
  include ActionView::Helpers::AssetUrlHelper
  include ActiveStorageSupport::SupportForBase64

  PARTNER = 'Partner'

  has_many :client_accesses, dependent: :destroy
  has_many :projects, foreign_key: 'domain_id', dependent: :destroy
  has_many :memberships, dependent: :destroy
  has_many :users, through: :memberships
  has_many :domains, dependent: :destroy
  has_many :children, class_name: 'Client', foreign_key: 'parent_id', dependent: :destroy
  has_many :authorizations, dependent: :destroy
  has_one_base64_attached :logo
  belongs_to :parent, foreign_key: 'parent_id', class_name: 'Client', optional: true

  validates_presence_of :name

  before_create :set_uuid

  def as_json(options = {})
    super.as_json.merge(logo_url: logo_url)
  end

  def partner?
    contact_type == PARTNER
  end

  def logo_url
    return logo.blob.service_url(expires_in: 1.week) if partner? && logo.attached?

    parsed_url = URI.parse(Rails.application.credentials[:app_host])

    image_url(
      'mercury-analytics-logo.png',
      host: "#{parsed_url.scheme}://api.#{parsed_url.hostname}"
    )
  end

  private

  def set_uuid
    self.uuid = SecureRandom.uuid
  end
end
