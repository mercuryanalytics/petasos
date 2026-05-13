# frozen_string_literal: true

lock "~> 3.20.0"

set :application, "petasos"
set :repo_url, "git@github.com:mercuryanalytics/petasos.git"

set :default_env, path: "/usr/lib/fullstaq-ruby/versions/3.3.4-jemalloc/bin:$PATH"

set :branch, "main"
set :linked_dirs, fetch(:linked_dirs, []).push("log", "tmp/pids", "tmp/cache", "tmp/sockets", "vendor/bundle", "public/system")
set :linked_files, %w[config/master.key]
set :keep_releases, 5
set :passenger_restart_with_touch, true
