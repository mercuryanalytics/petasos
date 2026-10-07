# frozen_string_literal: true

module QueryCountHelpers
  # Number of SQL statements ActiveRecord runs inside the block, ignoring
  # schema introspection.
  def count_queries(&block)
    count = 0
    counter = ->(*, payload) { count += 1 unless payload[:name] == 'SCHEMA' }
    ActiveSupport::Notifications.subscribed(counter, 'sql.active_record', &block)
    count
  end

  # The `authorized` attribute of the user with this email in the last
  # `GET .../authorized` response.
  def authorized_for(email)
    response.parsed_body['data'].find {|u| u['email'] == email }.fetch('authorized')
  end
end

RSpec.configure do |config|
  config.include QueryCountHelpers, type: :request
end
