module Authorized
  extend ActiveSupport::Concern

  included do
    scope :authorized_for_user, -> (membership_ids) do
      join_query = sanitize_sql(
        <<-SQL
          INNER JOIN authorizations ON 
            #{table_name}.id = authorizations.subject_id AND 
            authorizations.subject_class = "#{name}" AND
            authorizations.membership_id IN (#{membership_ids.join(',')})
        SQL
      )
      joins(join_query) unless membership_ids.empty?
    end
  end
end
