# frozen_string_literal: true

# Emit one structured JSON object per request to log/#{Rails.env}.json for
# CloudWatch ingestion, in addition to Rails' native human-readable
# log/#{Rails.env}.log (kept intact via keep_original_rails_log). Field
# extraction lives in LogrageFields so it stays unit-testable. See
# docs/superpowers/specs/2026-06-10-lograge-json-logging-design.md.
#
# Production only. Staging deploys today run with RAILS_ENV=production, so this
# covers staging too. If staging becomes a real Rails env, change the guard to
# `Rails.env.production? || Rails.env.staging?` (the .json path already follows
# Rails.env).
if Rails.env.production?
  Rails.application.configure do
    config.lograge.enabled = true
    config.lograge.keep_original_rails_log = true
    config.lograge.formatter = Lograge::Formatters::Json.new

    # Dedicated sink. A plain ActiveSupport::Logger defaults to SimpleFormatter,
    # which writes the message verbatim + "\n" — one bare JSON object per line,
    # no "I, [ts] INFO" prefix. The JSON never mixes with the human log.
    config.lograge.logger = ActiveSupport::Logger.new(Rails.root.join("log", "#{Rails.env}.json"))

    config.lograge.custom_payload {|controller| LogrageFields.payload(controller) }
    config.lograge.custom_options {|event| LogrageFields.options(event) }
  end
end
