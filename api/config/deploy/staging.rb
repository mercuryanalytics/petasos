# frozen_string_literal: true

set :ssh_options, forward_agent: true

server "petasos-staging.us-east-1", user: "deployer", roles: %w[web app db]

# Staging shares the production database. Disable automatic migrations on
# deploy so staging deploys do not alter production schema prematurely;
# migrations run from production deploys only.
Rake::Task["deploy:migrate"].clear_actions if Rake::Task.task_defined?("deploy:migrate")
