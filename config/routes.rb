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
=begin
                               Prefix Verb   URI Pattern                                                                              Controller#Action
                             rswag_ui        /api-docs                                                                                Rswag::Ui::Engine
                            rswag_api        /api-docs                                                                                Rswag::Api::Engine
                                 test GET    /test(.:format)                                                                          test#hello
                api_v1_client_domains GET    /api/v1/clients/:client_id/domains(.:format)                                             api/v1/domains#index
                                      POST   /api/v1/clients/:client_id/domains(.:format)                                             api/v1/domains#create
                 api_v1_client_domain GET    /api/v1/clients/:client_id/domains/:id(.:format)                                         api/v1/domains#show
                                      PATCH  /api/v1/clients/:client_id/domains/:id(.:format)                                         api/v1/domains#update
                                      PUT    /api/v1/clients/:client_id/domains/:id(.:format)                                         api/v1/domains#update
                                      DELETE /api/v1/clients/:client_id/domains/:id(.:format)                                         api/v1/domains#destroy
              api_v1_client_templates GET    /api/v1/clients/:client_id/templates(.:format)                                           api/v1/templates#index
                                      POST   /api/v1/clients/:client_id/templates(.:format)                                           api/v1/templates#create
                orphans_api_v1_client GET    /api/v1/clients/:id/orphans(.:format)                                                    api/v1/clients#orphans
             authorized_api_v1_client GET    /api/v1/clients/:id/authorized(.:format)                                                 api/v1/clients#authorized
              authorize_api_v1_client POST   /api/v1/clients/:id/authorize(.:format)                                                  api/v1/clients#authorize
                       api_v1_clients GET    /api/v1/clients(.:format)                                                                api/v1/clients#index
                                      POST   /api/v1/clients(.:format)                                                                api/v1/clients#create
                        api_v1_client GET    /api/v1/clients/:id(.:format)                                                            api/v1/clients#show
                                      PATCH  /api/v1/clients/:id(.:format)                                                            api/v1/clients#update
                                      PUT    /api/v1/clients/:id(.:format)                                                            api/v1/clients#update
                                      DELETE /api/v1/clients/:id(.:format)                                                            api/v1/clients#destroy
              orphans_api_v1_projects GET    /api/v1/projects/orphans(.:format)                                                       api/v1/projects#orphans
            authorized_api_v1_project GET    /api/v1/projects/:id/authorized(.:format)                                                api/v1/projects#authorized
             authorize_api_v1_project POST   /api/v1/projects/:id/authorize(.:format)                                                 api/v1/projects#authorize
                      api_v1_projects GET    /api/v1/projects(.:format)                                                               api/v1/projects#index
                                      POST   /api/v1/projects(.:format)                                                               api/v1/projects#create
                       api_v1_project GET    /api/v1/projects/:id(.:format)                                                           api/v1/projects#show
                                      PATCH  /api/v1/projects/:id(.:format)                                                           api/v1/projects#update
                                      PUT    /api/v1/projects/:id(.:format)                                                           api/v1/projects#update
                                      DELETE /api/v1/projects/:id(.:format)                                                           api/v1/projects#destroy
               orphans_api_v1_reports GET    /api/v1/reports/orphans(.:format)                                                        api/v1/reports#orphans
             authorized_api_v1_report GET    /api/v1/reports/:id/authorized(.:format)                                                 api/v1/reports#authorized
              authorize_api_v1_report POST   /api/v1/reports/:id/authorize(.:format)                                                  api/v1/reports#authorize
                       api_v1_reports GET    /api/v1/reports(.:format)                                                                api/v1/reports#index
                                      POST   /api/v1/reports(.:format)                                                                api/v1/reports#create
                        api_v1_report GET    /api/v1/reports/:id(.:format)                                                            api/v1/reports#show
                                      PATCH  /api/v1/reports/:id(.:format)                                                            api/v1/reports#update
                                      PUT    /api/v1/reports/:id(.:format)                                                            api/v1/reports#update
                                      DELETE /api/v1/reports/:id(.:format)                                                            api/v1/reports#destroy
             researchers_api_v1_users GET    /api/v1/users/researchers(.:format)                                                      api/v1/users#researchers
                      me_api_v1_users GET    /api/v1/users/me(.:format)                                                               api/v1/users#me
          reset_password_api_v1_users POST   /api/v1/users/reset_password(.:format)                                                   api/v1/users#reset_password
               authorized_api_v1_user GET    /api/v1/users/:id/authorized(.:format)                                                   api/v1/users#authorized
                   scopes_api_v1_user POST   /api/v1/users/:id/scopes(.:format)                                                       api/v1/users#scopes
                     copy_api_v1_user POST   /api/v1/users/:id/copy(.:format)                                                         api/v1/users#copy
                         api_v1_users GET    /api/v1/users(.:format)                                                                  api/v1/users#index
                                      POST   /api/v1/users(.:format)                                                                  api/v1/users#create
                          api_v1_user GET    /api/v1/users/:id(.:format)                                                              api/v1/users#show
                                      PATCH  /api/v1/users/:id(.:format)                                                              api/v1/users#update
                                      PUT    /api/v1/users/:id(.:format)                                                              api/v1/users#update
                                      DELETE /api/v1/users/:id(.:format)                                                              api/v1/users#destroy
                api_v1_reset_password POST   /api/v1/reset-password(.:format)                                                         api/v1/password_reset#create
               api_v1_change_password POST   /api/v1/change-password(.:format)                                                        api/v1/password_reset#update
                        api_v1_scopes GET    /api/v1/scopes(.:format)                                                                 api/v1/scopes#index
                    api_v1_logo_index GET    /api/v1/logo(.:format)                                                                   api/v1/logo#index
        rails_mandrill_inbound_emails POST   /rails/action_mailbox/mandrill/inbound_emails(.:format)                                  action_mailbox/ingresses/mandrill/inbound_emails#create
        rails_postmark_inbound_emails POST   /rails/action_mailbox/postmark/inbound_emails(.:format)                                  action_mailbox/ingresses/postmark/inbound_emails#create
           rails_relay_inbound_emails POST   /rails/action_mailbox/relay/inbound_emails(.:format)                                     action_mailbox/ingresses/relay/inbound_emails#create
        rails_sendgrid_inbound_emails POST   /rails/action_mailbox/sendgrid/inbound_emails(.:format)                                  action_mailbox/ingresses/sendgrid/inbound_emails#create
         rails_mailgun_inbound_emails POST   /rails/action_mailbox/mailgun/inbound_emails/mime(.:format)                              action_mailbox/ingresses/mailgun/inbound_emails#create
       rails_conductor_inbound_emails GET    /rails/conductor/action_mailbox/inbound_emails(.:format)                                 rails/conductor/action_mailbox/inbound_emails#index
                                      POST   /rails/conductor/action_mailbox/inbound_emails(.:format)                                 rails/conductor/action_mailbox/inbound_emails#create
        rails_conductor_inbound_email GET    /rails/conductor/action_mailbox/inbound_emails/:id(.:format)                             rails/conductor/action_mailbox/inbound_emails#show
                                      PATCH  /rails/conductor/action_mailbox/inbound_emails/:id(.:format)                             rails/conductor/action_mailbox/inbound_emails#update
                                      PUT    /rails/conductor/action_mailbox/inbound_emails/:id(.:format)                             rails/conductor/action_mailbox/inbound_emails#update
                                      DELETE /rails/conductor/action_mailbox/inbound_emails/:id(.:format)                             rails/conductor/action_mailbox/inbound_emails#destroy
rails_conductor_inbound_email_reroute POST   /rails/conductor/action_mailbox/:inbound_email_id/reroute(.:format)                      rails/conductor/action_mailbox/reroutes#create
                   rails_service_blob GET    /rails/active_storage/blobs/:signed_id/*filename(.:format)                               active_storage/blobs#show
            rails_blob_representation GET    /rails/active_storage/representations/:signed_blob_id/:variation_key/*filename(.:format) active_storage/representations#show
                   rails_disk_service GET    /rails/active_storage/disk/:encoded_key/*filename(.:format)                              active_storage/disk#show
            update_rails_disk_service PUT    /rails/active_storage/disk/:encoded_token(.:format)                                      active_storage/disk#update
                 rails_direct_uploads POST   /rails/active_storage/direct_uploads(.:format)                                           active_storage/direct_uploads#create

Routes for Rswag::Ui::Engine:


Routes for Rswag::Api::Engine:
=end
