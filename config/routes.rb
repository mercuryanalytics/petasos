MercurySsoAuth0::Engine.routes.draw do
  get 'auth/auth0/callback' => 'auth0#callback'
  get 'auth/failure' => 'auth0#failure'
  get 'auth/login' => 'auth0#login'
end
