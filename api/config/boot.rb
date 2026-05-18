# frozen_string_literal: true

ENV["BUNDLE_GEMFILE"] ||= File.expand_path("../Gemfile", __dir__)

require "bundler/setup" # Set up gems listed in the Gemfile.
require "logger"        # Rails 6.1+ no longer autoloads stdlib Logger before ActiveSupport.
require "bootsnap/setup" # Speed up boot time by caching expensive operations.
