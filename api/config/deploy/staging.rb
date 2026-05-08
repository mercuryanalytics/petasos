# frozen_string_literal: true

set :ssh_options, {
  forward_agent: true,
  auth_methods: %w[publickey],
  encryption: %w[aes128-ctr aes192-ctr aes256-ctr aes128-gcm@openssh.com aes256-gcm@openssh.com chacha20-poly1305@openssh.com]
}

server "petasos-staging.us-east-1", user: "ubuntu", roles: %w[web app db]

# Staging shares the production database. Disable automatic migrations on
# deploy so staging deploys do not alter production schema prematurely;
# migrations run from production deploys only.
Rake::Task["deploy:migrate"].clear_actions if Rake::Task.task_defined?("deploy:migrate")
