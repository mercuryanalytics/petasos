# frozen_string_literal: true

module Authorized
  extend ActiveSupport::Concern

  included do
    has_many :subject_authorizations, class_name: 'Authorization', as: :subject, foreign_type: :subject_class, dependent: nil

    scope :authorized_for_user, lambda {|membership_ids|
      joins(:subject_authorizations).where(subject_authorizations: { membership_id: membership_ids })
    }
  end
end
