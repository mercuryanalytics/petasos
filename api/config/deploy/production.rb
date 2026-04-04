# frozen_string_literal: true

set :ssh_options, {
  forward_agent: true,
  auth_methods: %w[publickey],
  encryption: %w[aes128-ctr aes192-ctr aes256-ctr aes128-gcm@openssh.com aes256-gcm@openssh.com chacha20-poly1305@openssh.com]
}

server "researchresultswebsite.us-east-1", user: "ubuntu", roles: %w[web app db]
