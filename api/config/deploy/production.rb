# frozen_string_literal: true

set :ssh_options, forward_agent: true

server "petasos.us-east-1", user: "deployer", roles: %w[web app db]
