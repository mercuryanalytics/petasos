Rails.application.routes.draw do
  mount MercurySsoAuth0::Engine => "/mercury_sso_auth0"
end
