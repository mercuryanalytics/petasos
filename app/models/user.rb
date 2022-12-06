class User < ApplicationRecord
  has_many :memberships, dependent: :destroy
  has_many :authorizations, through: :memberships
  has_many :clients, through: :memberships
  has_and_belongs_to_many :scopes, dependent: :destroy

  attr_accessor :authorized

  scope :researchers, -> {
    joins(:scopes).where(scopes: { action: 'research', scope: 'user' }).order(contact_name: :asc)
  }

  scope :for_client, -> (client_id) {
    joins(:memberships).where(memberships: { client_id: client_id })
  }

  def client_ids
    @client_ids ||= self.memberships.pluck(:client_id)
  end

  def client_scopes
    []
  end

  def membership_ids
    @membership_ids ||= self.memberships.pluck(:id)
  end

  def admin?
    @admin ||= scopes.pluck(:action).include?('admin')
  end

  def as_json(options = {})
    super.merge(client_ids: client_ids, authorized: authorized)
  end
end
