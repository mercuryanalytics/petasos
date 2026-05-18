# frozen_string_literal: true

require 'rails_helper'

# Request spec for Api::V1::LogoController -- GET /api/v1/logo.
#
# Coverage:
#   * authenticated happy path is N/A: LogoController extends
#     ApplicationController (= ActionController::API) directly. It does NOT
#     include the Secured / MercurySsoAuth0::Authenticated concern, so the
#     endpoint is intentionally unauthenticated. The "happy path" scenarios
#     below therefore exercise the endpoint with no Authorization header.
#   * missing/invalid token (401) is N/A for the same reason -- no auth is
#     ever required by this action, so an invalid token does not flip the
#     status. A note is left below in lieu of an example.
#   * insufficient scope (403) is N/A for the same reason.
#   * validation failure (422) is N/A: the action takes one optional
#     `subdomain` param and never fails validation -- missing/unknown
#     subdomains return 200 with the default fallback URL. Documented inline
#     so future readers don't expect a 422 example here.
#
# The spec uses a real fixture PNG (spec/fixtures/files/test_logo.png)
# attached through ActiveStorage rather than mocking ActiveStorage / file
# handling. The :test storage service writes to tmp/storage on disk.
RSpec.describe 'Api::V1::Logo', type: :request do
  let(:logo_path) { '/api/v1/logo' }
  let(:fixture_logo) do
    fixture_file_upload(
      Rails.root.join('spec/fixtures/files/test_logo.png'),
      'image/png'
    )
  end

  before do
    # Match prior-art (spec/requests/auth_integration_spec.rb): test env only
    # allowlists `localhost` in config.hosts, so request specs need to set
    # the host explicitly to avoid a Rails 6 host-authorization 403.
    host! 'localhost'
    # ActiveStorage's Disk service builds blob URLs from
    # `ActiveStorage::Current.url_options`. The application does not configure
    # a default URL host at boot, and `ActiveStorage::Current` (an
    # ActiveSupport::CurrentAttributes subclass) is reset by middleware at
    # the start of every request -- so setting it in this `before` block
    # alone doesn't survive into the controller action. Stubbing the
    # accessor keeps the host visible inside the request as well.
    allow(ActiveStorage::Current).to receive(:url_options).and_return(host: 'localhost')
  end

  describe 'GET /api/v1/logo' do
    context 'when a client with the requested subdomain has a logo attached' do
      let!(:client) do
        c = create(:client, subdomain: 'acme')
        c.logo.attach(
          io: Rails.root.join('spec/fixtures/files/test_logo.png').open,
          filename: 'test_logo.png',
          content_type: 'image/png'
        )
        c
      end

      it 'returns 200 with the attached logo URL' do
        get logo_path, params: { subdomain: 'acme' }

        expect(response).to have_http_status(:ok)
        body = response.parsed_body
        expect(body).to have_key('data')
        expect(body['data']).to have_key('logo')
        # ActiveStorage's :test service builds blob URLs under
        # /rails/active_storage/disk/... The URL is presigned with `expires_in`
        # so we don't assert on its full value, just that it's a non-empty
        # HTTP URL pointing at the ActiveStorage disk service.
        expect(body['data']['logo']).to be_a(String)
        expect(body['data']['logo']).to start_with('http')
        expect(body['data']['logo']).to include('rails/active_storage')
      end
    end

    context 'when a client with the requested subdomain has no logo attached' do
      let!(:client) { create(:client, subdomain: 'naked') }

      it 'returns 200 with the default fallback logo URL' do
        get logo_path, params: { subdomain: 'naked' }

        expect(response).to have_http_status(:ok)
        body = response.parsed_body
        expect(body['data']).to have_key('logo')
        # Falls back to image_url for mercury-analytics-logo.png.
        expect(body['data']['logo']).to include('mercury-analytics-logo')
      end
    end

    context 'when no client matches the requested subdomain' do
      it 'returns 200 with the default fallback logo URL' do
        get logo_path, params: { subdomain: 'does-not-exist' }

        expect(response).to have_http_status(:ok)
        body = response.parsed_body
        expect(body['data']).to have_key('logo')
        expect(body['data']['logo']).to include('mercury-analytics-logo')
      end
    end

    context 'when no subdomain param is supplied' do
      it 'returns 200 with the default fallback logo URL' do
        get logo_path

        expect(response).to have_http_status(:ok)
        body = response.parsed_body
        expect(body['data']).to have_key('logo')
        expect(body['data']['logo']).to include('mercury-analytics-logo')
      end
    end

    context 'when called with an arbitrary (invalid) bearer token' do
      # LogoController is intentionally unauthenticated (see top-of-file
      # comment). This scenario documents that an Authorization header is
      # ignored, NOT a 401-producing case.
      it 'still returns 200 (endpoint does not require auth)' do
        get logo_path,
            params: { subdomain: 'whatever' },
            headers: { 'Authorization' => 'Bearer not-a-real-token' }

        expect(response).to have_http_status(:ok)
      end
    end
  end
end
