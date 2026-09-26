# frozen_string_literal: true

module Authorized
  extend ActiveSupport::Concern

  included do
    # An empty membership_ids renders as WHERE 1=0, so it matches nothing.
    scope :authorized_for_user, lambda {|membership_ids|
      joins(
        "INNER JOIN authorizations ON authorizations.subject_id = #{table_name}.id " \
        "AND authorizations.subject_class = #{connection.quote(name)}"
      ).where(authorizations: { membership_id: membership_ids })
    }
  end
end
