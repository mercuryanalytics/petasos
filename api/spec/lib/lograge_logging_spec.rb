# frozen_string_literal: true

require 'rails_helper'

# Integration smoke for the lograge wiring: drives lograge's real
# ActionController LogSubscriber, the Json formatter, and our LogrageFields
# through a constructed process_action event, and asserts the emitted line is a
# single well-formed JSON object carrying the lograge built-ins plus our custom
# fields. This exercises everything except the append_info_to_payload patch and
# the production-only initializer, both of which can only be verified by booting
# the production env (no master key in CI) — see the design spec.
#
# It touches Lograge module accessors directly (mirroring what the initializer
# sets) and restores them afterward, so it does not attach a global subscriber
# or monkey-patch ActionController::Base — the rest of the suite is untouched.
RSpec.describe 'lograge JSON logging' do
  let(:output) { StringIO.new }
  let(:subscriber) { Lograge::LogSubscribers::ActionController.new }

  let(:controller) do
    klass = Class.new do
      attr_reader :request

      def initialize(request)
        @request = request
      end
    end
    request = instance_double('ActionDispatch::Request', request_id: 'req-xyz-789')
    controller = klass.new(request)
    controller.instance_variable_set(:@current_user, double('User', id: 7))
    controller
  end

  def emit(payload)
    start = Time.zone.now
    event = ActiveSupport::Notifications::Event.new(
      'process_action.action_controller', start, start + 0.0123, 'evt-1', payload
    )
    subscriber.process_action(event)
    output.string.each_line.map {|line| JSON.parse(line) }
  end

  around do |example|
    saved = {
      logger: Lograge.logger,
      formatter: Lograge.formatter,
      custom_options: Lograge.class_variable_get(:@@custom_options)
    }
    Lograge.logger = ActiveSupport::Logger.new(output)
    Lograge.formatter = Lograge::Formatters::Json.new
    Lograge.custom_options = ->(event) { LogrageFields.options(event) }
    example.run
  ensure
    Lograge.logger = saved[:logger]
    Lograge.formatter = saved[:formatter]
    Lograge.custom_options = saved[:custom_options]
  end

  it 'emits one well-formed JSON object per request with built-ins and custom fields' do
    lines = emit(
      method: 'POST',
      path: '/api/v1/clients?foo=bar',
      format: :json,
      controller: 'Api::V1::ClientsController',
      action: 'create',
      status: 201,
      custom_payload: LogrageFields.payload(controller)
    )

    expect(lines.size).to eq(1)
    record = lines.first
    expect(record).to include(
      'method' => 'POST',
      'path' => '/api/v1/clients', # query string stripped by lograge
      'controller' => 'Api::V1::ClientsController',
      'action' => 'create',
      'status' => 201,
      'request_id' => 'req-xyz-789',
      'user_id' => 7
    )
    expect(record['duration']).to be_within(0.5).of(12.3)
    expect(record['time']).to match(%r{\A\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\z})
  end

  it 'includes the exception class and message on a server error' do
    record = emit(
      method: 'GET',
      path: '/api/v1/clients/999',
      format: :json,
      controller: 'Api::V1::ClientsController',
      action: 'show',
      status: 500,
      exception_object: ActiveRecord::RecordNotFound.new("Couldn't find Client"),
      custom_payload: LogrageFields.payload(controller)
    ).first

    expect(record['status']).to eq(500)
    expect(record['exception']).to eq('ActiveRecord::RecordNotFound')
    expect(record['exception_message']).to eq("Couldn't find Client")
  end
end
