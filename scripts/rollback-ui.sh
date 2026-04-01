#!/usr/bin/env bash
# Roll back the researchresultswebsite.com front-end to a previous deploy.
#
# Usage:
#   ./scripts/rollback-ui.sh [--staging]               # list available artifacts
#   ./scripts/rollback-ui.sh [--staging] <commit-sha>  # deploy that artifact

set -euo pipefail

ARTIFACTS_BUCKET="petasos-deploy-artifacts"
REGION="us-east-1"

# Parse optional --staging flag
STAGE="production"
LIVE_BUCKET="researchresultswebsite.com"
DISTRIBUTION_ID="E2IN2S8Y736ATD"

if [ "${1:-}" = "--staging" ]; then
  STAGE="staging"
  LIVE_BUCKET="petasos-staging"
  DISTRIBUTION_ID="E1J9NLGI9G05ZN"
  shift
fi

if [ -z "${1:-}" ]; then
  echo "Available ${STAGE} deploy artifacts (most recent first):"
  aws s3 ls s3://${ARTIFACTS_BUCKET}/${STAGE}/ --region ${REGION} | sort -r | head -20
  echo ""
  echo "Usage: $0 [--staging] <commit-sha>"
  exit 0
fi

if [ -z "${DISTRIBUTION_ID}" ]; then
  echo "Error: staging DISTRIBUTION_ID not set. Run: DISTRIBUTION_ID=<id> $0 --staging <sha>"
  exit 1
fi

COMMIT_SHA="$1"
ARTIFACT="${STAGE}/deploy-${COMMIT_SHA}.zip"
TMPDIR=$(mktemp -d)
trap "rm -rf ${TMPDIR}" EXIT

echo "Downloading ${ARTIFACT}..."
aws s3 cp s3://${ARTIFACTS_BUCKET}/${ARTIFACT} ${TMPDIR}/deploy.zip --region ${REGION}

echo "Extracting..."
unzip -q ${TMPDIR}/deploy.zip -d ${TMPDIR}/build

echo "Syncing to s3://${LIVE_BUCKET}..."
aws s3 sync ${TMPDIR}/build/ s3://${LIVE_BUCKET}/ --region ${REGION}

echo "Invalidating CloudFront (${DISTRIBUTION_ID})..."
aws cloudfront create-invalidation --distribution-id ${DISTRIBUTION_ID} --paths "/*"

echo "Done. Rolled back ${STAGE} to commit ${COMMIT_SHA}."
