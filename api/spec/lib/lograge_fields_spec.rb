# frozen_string_literal: true

require 'rails_helper'

RSpec.describe LogrageFields do
  describe '.payload' do
    let(:request) { instance_double('ActionDispatch::Request', request_id: 'req-abc-123') }

    let(:controller_class) do
      Class.new do
        attr_reader :request

        def initialize(request)
          @request = request
        end
      end
    end

    def controller_with(current_user:)
      controller = controller_class.new(request)
      controller.instance_variable_set(:@current_user, current_user) unless current_user.nil?
      controller
    end

    it 'returns the request id' do
      payload = described_class.payload(controller_with(current_user: nil))
      expect(payload[:request_id]).to eq('req-abc-123')
    end

    it 'returns the current user id when @current_user is set' do
      user = double('User', id: 42)
      payload = described_class.payload(controller_with(current_user: user))
      expect(payload[:user_id]).to eq(42)
    end

    it 'returns user_id: nil when @current_user is unset (unauthenticated)' do
      payload = described_class.payload(controller_with(current_user: nil))
      expect(payload[:user_id]).to be_nil
    end

    it 'reads the @current_user ivar rather than calling current_user' do
      # petasos's Secured#current_user re-queries the DB and raises on failed
      # auth; the payload runs outside its rescue scope, so it must never invoke
      # the method. A controller whose current_user raises must still log nil.
      controller = Class.new do
        attr_reader :request

        def initialize(request)
          @request = request
        end

        def current_user
          raise 'current_user must not be called from the lograge payload'
        end
      end.new(request)

      expect { described_class.payload(controller) }.not_to raise_error
      expect(described_class.payload(controller)[:user_id]).to be_nil
    end
  end

  describe '.options' do
    def event_with(payload = {})
      instance_double('ActiveSupport::Notifications::Event', payload: payload)
    end

    it 'always includes a parseable ISO8601 time with milliseconds' do
      options = described_class.options(event_with)
      expect(options[:time]).to match(%r{\A\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\z})
      expect { Time.iso8601(options[:time]) }.not_to raise_error
    end

    it 'includes no exception keys when there is no exception' do
      options = described_class.options(event_with)
      expect(options).not_to have_key(:exception)
      expect(options).not_to have_key(:exception_message)
    end

    it 'includes the exception class and message when an exception_object is present' do
      error = ActiveRecord::RecordNotFound.new('Couldn\'t find Client')
      options = described_class.options(event_with(exception_object: error))
      expect(options[:exception]).to eq('ActiveRecord::RecordNotFound')
      expect(options[:exception_message]).to eq('Couldn\'t find Client')
    end
  end
end
