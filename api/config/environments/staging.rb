# frozen_string_literal: true

# Staging runs the production configuration. This file exists so that
# Rails.env.staging? is true on the staging box (petasos-staging), which today
# boots with --environment production via the server's passenger-app launcher.
# Add staging-only overrides in a Rails.application.configure block below as the
# need arises; there are none yet.
require_relative "production"
