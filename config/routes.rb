Rails.application.routes.draw do
  mount Rswag::Ui::Engine => '/api-docs'
  mount Rswag::Api::Engine => '/api-docs'
  get 'test', to: 'test#hello'

  namespace :api do
    namespace :v1 do
      resources :clients do
        resources :domains
        resources :templates, only: %i(create index)

        member do
          get :orphans
          get :authorized
          post :authorize
        end
      end
      resources :projects do
        collection { get :orphans }
        member do
          get :authorized
          post :authorize
        end
      end
      resources :reports do
        collection { get :orphans }
        member do
          get :authorized
          post :authorize
        end
      end
      resources :users do
        collection do
          get :researchers
          get :me
          post :reset_password
          post :update_last_login
        end
        member do
          get :authorized
          post :scopes
          post :copy
        end
      end

      post 'reset-password', action: :create, controller: 'password_reset'
      post 'change-password', action: :update, controller: 'password_reset'

      resources :scopes, only: %i(index)
      resources :logo, only: %i(index)
    end
  end
end
