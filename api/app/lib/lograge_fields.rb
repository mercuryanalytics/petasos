# frozen_string_literal: true

# Field extraction for lograge's per-request JSON record, kept out of the
# initializer so it can be unit-tested directly. See
# docs/superpowers/specs/2026-06-10-lograge-json-logging-design.md.
class LogrageFields
  class << self
    # Lograge custom_payload: merged into the record from the controller.
    def payload(controller)
      {
        request_id: controller.request.request_id,
        # Read the memoized ivar, not Secured#current_user: that method
        # re-queries the DB and raises on failed auth, and this runs outside its
        # rescue_from scope. @current_user is set only after a successful auth,
        # so it is the user on authenticated requests and nil everywhere else.
        user_id: controller.instance_variable_get(:@current_user)&.id
      }
    end

    # Lograge custom_options: merged into the record from the request event.
    def options(event)
      fields = { time: Time.zone.now.utc.iso8601(3) }

      if (exception = event.payload[:exception_object])
        fields[:exception] = exception.class.name
        fields[:exception_message] = exception.message
      end

      fields
    end
  end
end
