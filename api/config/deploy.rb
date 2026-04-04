# frozen_string_literal: true

lock "~> 3.13.0"

set :application, "mercury-analytics-api"
set :repo_url, "git@github.com:mercuryanalytics/petasos.git"

set :deploy_to, "/home/ubuntu/mercury-analytics-api"
set :use_sudo, true
set :branch, "main"
set :puma_conf, "/home/ubuntu/mercury-analytics-api/shared/config/puma.rb"
set :linked_dirs, fetch(:linked_dirs, []).push("log", "tmp/pids", "tmp/cache", "tmp/sockets", "vendor/bundle", "public/system")
set :linked_files, %w[config/master.key]
set :keep_releases, 5
set :passenger_restart_with_touch, true
