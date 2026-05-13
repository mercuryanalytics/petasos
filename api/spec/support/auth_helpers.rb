# frozen_string_literal: true

require 'jwt'
require 'openssl'
require 'base64'
require 'json'
require 'webmock/rspec'

# AuthHelpers
#
# Shared test helpers for exercising the Auth0/JWT verification path
# (JsonWebToken.verify -> Secured concern) against a real-signed token.
#
# The helpers:
#   * generate a stable RSA keypair + self-signed X.509 cert for the test run
#     (matching the shape Auth0's JWKS exposes via x5c[0]),
#   * mint signed JWTs with arbitrary claims via #mint_jwt,
#   * stub the JWKS HTTP fetch via WebMock via #stub_jwks_endpoint!,
#   * stub the issuer/audience that JsonWebToken reads from credentials so
#     specs are independent of Rails credentials.
#
# Public interface (used by sibling issues 002-006 as the request-spec
# foundation):
#
#   AuthHelpers::TEST_ISS
#     => String. The fake Auth0 issuer URL the helper signs tokens against.
#        Always has a trailing slash (matching Auth0's iss claim format).
#
#   AuthHelpers::TEST_AUDIENCE
#     => String. The fake Auth0 API audience identifier.
#
#   AuthHelpers::TEST_KID
#     => String. The Key ID embedded in the JWT header and the JWKS entry.
#
#   AuthHelpers.test_private_key
#     => OpenSSL::PKey::RSA. Memoized RSA keypair for the test run.
#
#   AuthHelpers.test_public_key
#     => OpenSSL::PKey::RSA. Public half of the keypair.
#
#   AuthHelpers.jwks_response_body
#     => String. JSON body matching the Auth0 JWKS endpoint shape, with one
#        key whose x5c[0] is a base64-encoded self-signed cert holding the
#        test public key. Suitable as a WebMock response body.
#
#   mint_jwt(claims = {})
#     => String. Signed JWS using the test private key and default kid.
#        Default claims include iss, aud, sub, email, exp, iat -- caller may
#        override any of them. Because the method takes no keyword arguments,
#        callers may pass claims with the bare `sub: ..., email: ...` syntax
#        without explicit braces.
#
#   mint_jwt_with(claims_hash, options_hash)
#     => String. As above, but accepts an options hash with keys :key
#        (signing key, default AuthHelpers.test_private_key), :kid (default
#        TEST_KID), and :algorithm (default 'RS256'). Use this overload for
#        the "invalid signature" and "unknown kid" test cases. Both args are
#        positional Hashes so Ruby 2.5 keyword-argument disambiguation
#        doesn't bite.
#
#   stub_jwks_endpoint!(iss: AuthHelpers::TEST_ISS,
#                       body: AuthHelpers.jwks_response_body, status: 200)
#     => WebMock::RequestStub. Stubs GET "#{iss}.well-known/jwks.json" --
#        exactly the URL JsonWebToken.jwks_hash fetches.
#
#   stub_jwt_issuer_and_audience!(iss: AuthHelpers::TEST_ISS,
#                                 audience: AuthHelpers::TEST_AUDIENCE)
#     => Stubs JsonWebToken.iss and JsonWebToken.audience class methods so
#        verification doesn't need real Rails credentials.
#
#   auth_header(token)
#     => Hash. { 'Authorization' => "Bearer #{token}" } convenience for
#        request specs.
#
# To use in a spec, `include AuthHelpers` in the describe block or configure
# globally for `:request` specs in rails_helper. The helpers are framework-
# agnostic apart from `stub_request` (WebMock) and `allow(...).to receive`
# (RSpec mocks), both already loaded by rails_helper.
module AuthHelpers
  TEST_ISS      = 'https://petasos-test.auth0.test/'
  TEST_AUDIENCE = 'petasos-test-audience'
  TEST_KID      = 'petasos-test-kid'

  class << self
    # Memoized RSA keypair for the test run. Generating a 2048-bit key is
    # slow (~200ms), so we do it once per process.
    def test_private_key
      @test_private_key ||= OpenSSL::PKey::RSA.new(2048)
    end

    def test_public_key
      test_private_key.public_key
    end

    # A self-signed X.509 cert wrapping the test public key. JsonWebToken
    # parses x5c[0] as a base64-encoded DER cert and extracts public_key
    # from it, so the JWKS we serve must hand back exactly that shape.
    def test_certificate
      @test_certificate ||= build_test_certificate
    end

    # JSON string matching the Auth0 JWKS endpoint shape.
    def jwks_response_body
      {
        keys: [
          {
            kty: 'RSA',
            use: 'sig',
            alg: 'RS256',
            kid: TEST_KID,
            x5c: [Base64.strict_encode64(test_certificate.to_der)]
          }
        ]
      }.to_json
    end

    # Resets memoized keypair + cert. Intended for diagnostics, not normal
    # spec flow -- the keypair is fine to share across the run.
    def reset!
      @test_private_key = nil
      @test_certificate = nil
    end

    private

    def build_test_certificate
      cert = OpenSSL::X509::Certificate.new
      cert.version = 2
      cert.serial = 1
      cert.subject = OpenSSL::X509::Name.parse('/CN=petasos-test')
      cert.issuer = cert.subject
      cert.public_key = test_public_key
      cert.not_before = Time.at(0).utc
      cert.not_after = Time.at(0).utc + (50 * 365 * 24 * 60 * 60) # ~50 years
      cert.sign(test_private_key, OpenSSL::Digest.new('SHA256'))
      cert
    end
  end

  # Mints a signed JWS with sensible default Auth0-ish claims. Override any
  # claim via the hash arg, e.g. `mint_jwt(sub: 'auth0|x', exp: ...)`.
  #
  # No keyword args -- this lets callers pass claim keys with the bare
  # `sub: x, email: y` syntax under Ruby 2.5 without explicit braces.
  # For non-default signing key, kid, or algorithm, use `mint_jwt_with`.
  def mint_jwt(claims = {})
    mint_jwt_with(claims, {})
  end

  # As `mint_jwt`, but takes a second positional hash for token options:
  #   :key       => signing key (default AuthHelpers.test_private_key)
  #   :kid       => header kid claim (default AuthHelpers::TEST_KID)
  #   :algorithm => signing algorithm (default 'RS256')
  #
  # Both arguments are positional Hashes; this avoids the Ruby 2.5 keyword/
  # positional disambiguation pitfall and keeps the two test scenarios
  # ("invalid signature", "unknown kid") explicit at the call site.
  def mint_jwt_with(claims, options)
    options ||= {}
    key       = options.fetch(:key, AuthHelpers.test_private_key)
    kid       = options.fetch(:kid, AuthHelpers::TEST_KID)
    algorithm = options.fetch(:algorithm, 'RS256')

    now = Time.now.to_i
    defaults = {
      iss: AuthHelpers::TEST_ISS,
      aud: AuthHelpers::TEST_AUDIENCE,
      sub: 'auth0|test-subject',
      email: 'test-user@example.test',
      iat: now,
      exp: now + 3600
    }
    payload = defaults.merge(claims)
    headers = { kid: kid, alg: algorithm, typ: 'JWT' }
    JWT.encode(payload, key, algorithm, headers)
  end

  # Stubs the JWKS HTTP fetch JsonWebToken.jwks_hash makes. The URL
  # construction in production code is `URI("#{iss}.well-known/jwks.json")`,
  # so iss MUST end with a slash.
  def stub_jwks_endpoint!(iss: AuthHelpers::TEST_ISS, body: AuthHelpers.jwks_response_body, status: 200)
    url = "#{iss}.well-known/jwks.json"
    stub_request(:get, url).to_return(status: status, body: body, headers: { 'Content-Type' => 'application/json' })
  end

  # Stubs JsonWebToken's class-level config readers so we can verify against
  # the test iss/aud without needing decrypted Rails credentials.
  def stub_jwt_issuer_and_audience!(iss: AuthHelpers::TEST_ISS, audience: AuthHelpers::TEST_AUDIENCE)
    allow(JsonWebToken).to receive(:iss).and_return(iss)
    allow(JsonWebToken).to receive(:audience).and_return(audience)
  end

  # Convenience for request specs: header hash with the Authorization Bearer.
  def auth_header(token)
    { 'Authorization' => "Bearer #{token}" }
  end
end
