$:.push File.expand_path("lib", __dir__)

# Maintain your gem's version:
require "mercury_sso_auth0/version"

# Describe your gem and declare its dependencies:
Gem::Specification.new do |spec|
  spec.name        = "mercury_sso_auth0"
  spec.version     = MercurySsoAuth0::VERSION
  spec.authors     = ["Relu Burlan"]
  spec.email       = ["aurelian.burlan@e-spres-oh.com"]
  spec.homepage    = "https://github.com/mercuryanalytics/mercury-analytics-sso-auth0"
  spec.summary     = "Auth0 SSO Engine"
  spec.description = "Auth0 Engine implementation for MercuryAnalytics apps"
  spec.license     = "MIT"

  spec.files = Dir["{app,config,db,lib}/**/*", "MIT-LICENSE", "Rakefile", "README.md"]

  spec.add_dependency "railties", ">= 4.0.0"
  spec.add_dependency 'omniauth'
  spec.add_dependency 'omniauth-auth0', '~> 2.2'
  # spec.add_dependency 'omniauth-rails_csrf_protection', '~> 0.1'
  spec.add_dependency 'rest-client'
end
