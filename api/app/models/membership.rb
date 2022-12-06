class Membership < ApplicationRecord
  belongs_to :user
  belongs_to :client
  has_many :authorizations, dependent: :destroy
  has_many :clients_authorizations, -> { for_clients }, class_name: 'Authorization'
end
